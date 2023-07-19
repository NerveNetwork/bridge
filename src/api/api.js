import nuls from "nuls-sdk-js";
import nerve from "nerve-sdk-js";
import { ethers } from "ethers";
import sdk from "nerve-sdk-js/lib/api/sdk";
import { Plus, htmlEncode, timesDecimals, Minus, getChainConfigs, divisionAndFix } from './util';
import { post, request } from './https';
import { ETHNET } from "@/config"
const Signature = require("elliptic/lib/elliptic/ec/signature");
const txsignatures = require("nerve-sdk-js/lib/model/txsignatures");
import BufferReader from "nerve-sdk-js/lib/utils/bufferreader";
import txs from "nerve-sdk-js/lib/model/txs";

const Web3 = require('web3');

// NULS NERVE跨链手续费
export const crossFee = 0.01;
const nSdk = {NERVE: nerve, NULS: nuls};

export class NTransfer {

  constructor(props) {
    if (!props.chain) {
      throw "未获取到交易网络，组装交易失败";
    }
    this.chain = props.chain; //链网络
    this.type = props.type; //交易类型
    this.sdk = nSdk[this.chain] || nerve; // nerve nuls sdk
    this.walletType = localStorage.getItem("walletType");
  }

  async getTxHex(data) {
    const {inputs, outputs, txData, remarks = "", pub, signAddress} = data;
    // 组装交易
    const tAssemble = this.sdk.transactionAssemble(inputs, outputs, htmlEncode(remarks), this.type, txData);
    if (this.walletType === 'NaboxWallet' && window.NaboxWallet.isNULSLedger) {
      const unsignedHex = tAssemble.txSerialize().toString("hex")
      return await window.nabox.signNULSTransaction({ txHex: unsignedHex });
    }
    // 调用metamask签名hash，然后拼接公钥完成交易签名
    const hash = "0x" + tAssemble.getHash().toString("hex");

    if (!this.walletType) {
      return null
    }
    const signature = await this.signHash(hash, signAddress)

    /*let flat = await window[this.walletType].request({
      method: "eth_sign",
      params: [signAddress, hash]
    })
    // console.log(flat, 66, signAddress)
    flat = flat.slice(2) // 去掉0x
    const r = flat.slice(0, 64);
    const s = flat.slice(64, 128);
    // const recoveryParam = flat.slice(128)
    let signature = new Signature({r, s}).toDER("hex");
    // signature = signature.slice(2)*/

    const signData = this.sdk.appSplicingPub(signature, pub);
    tAssemble.signatures = signData;
    return tAssemble.txSerialize().toString("hex");
  }

  async appendSignature(data) {
    const { pub, signAddress, txHexForSign } = data;
    const bufferReader = new BufferReader(Buffer.from(txHexForSign, "hex"), 0);
    // 反序列回交易对象
    const tAssemble = new txs.Transaction();
    tAssemble.parse(bufferReader);
    const hash = "0x" + tAssemble.getHash().toString("hex");

    const signature = await this.signHash(hash, signAddress)
    //初始化签名对象
    const txSignData = new txsignatures.TransactionSignatures();
    // // 反序列化签名对象
    const reader = new BufferReader(tAssemble.signatures, 0);
    txSignData.parse(reader);
    // 追加签名到对象中
    txSignData.addSign(Buffer.from(pub, "hex"), Buffer.from(signature, 'hex'));
    /* txSignData.signatures.push({
      pubkey: pub,
      signData
    }) */
    tAssemble.signatures = txSignData.serialize();
    // tAssemble.signatures = signData;
    return tAssemble.txSerialize().toString("hex");
  }

  /**
   * @desc 利用metamask签名hash
   * @param hash 待签名交易hash
   * @param signAddress 签名账户地址
   */
  async signHash(hash, signAddress) {
    hash = hash.startsWith("0x") ? hash : "0x" + hash;
    let flat = await window[this.walletType].request({
      method: "eth_sign",
      params: [signAddress, hash]
    })
    // console.log(flat, 66, signAddress)
    flat = flat.slice(2) // 去掉0x
    const r = flat.slice(0, 64);
    const s = flat.slice(64, 128);
    // const recoveryParam = flat.slice(128)
    return new Signature({r, s}).toDER("hex");
    // signature = signature.slice(2)
  }

  async inputsOrOutputs(data) {
    if (!this.type) {
      throw "获取交易类型失败";
    }
    if (this.type === 2) {
      //链内交易
      return this.transferTransaction(data);
    } else if (this.type === 10) {
      //跨链交易
      return this.crossChainTransaction(data);
    } else if (this.type === 16) {
      //调用合约
      if (this.chain !== "NULS") {
        throw "nerve网络不支持合约操作";
      }
      return this.callContractTransaction(data);
    } else if (this.type === 43) {
      // nerve 网络提现到eth bsc
      return this.WithdrawalTransaction(data);
      /* const assetNerveInfo = await this.getAssetNerveInfo(data);
      if (assetNerveInfo) {
        data.assetsChainId = assetNerveInfo.chainId;
        data.assetsId = assetNerveInfo.assetId;
        return this.WithdrawalTransaction(data);
      } else {
        throw "获取该资产在nerve链上信息失败";
      } */
    }
  }

  //nuls nerve普通转账input output
  async transferTransaction(transferInfo) {
    const inputs = [], outputs = [];
    const { from, assetsChainId, assetsId, amount, fee, to } = transferInfo;
    //转账资产nonce
    const nonce = await this.getNonce(from, assetsChainId, assetsId);
    if (!nonce) throw "获取nonce值失败";
    const config = getChainConfigs();
    const mainAsset = config[this.chain];
    if (mainAsset.chainId === assetsChainId && mainAsset.assetId === assetsId) {
      // 转账资产为本链主资产, 将手续费和转账金额合成一个input
      const newAmount = Plus(amount, fee).toFixed();
      inputs.push({
        address: from,
        assetsChainId,
        assetsId,
        amount: newAmount,
        locked: 0,
        nonce: nonce
      });
    } else {
      inputs.push({
        address: from,
        assetsChainId,
        assetsId,
        amount,
        locked: 0,
        nonce:  transferInfo.nonce || nonce // 闪兑资产和跨链资产一样，闪兑后nonce值使用hash后16位
      });
      if (this.chain === 'NULS') {
        // nerve普通转账没有手续费
        const mainAssetNonce = await this.getNonce(from, mainAsset.chainId, mainAsset.assetId);
        inputs.push({
          address: from,
          assetsChainId: mainAsset.chainId,
          assetsId: mainAsset.assetId,
          amount: fee,
          locked: 0,
          nonce: mainAssetNonce
        });
      }
    }
    outputs.push({
      address: to,
      assetsChainId,
      assetsId,
      amount,
      lockTime: 0
    });
    return {inputs, outputs};
  }

  // nuls nerve跨链转账input output
  async crossChainTransaction(transferInfo) {
    const {inputs, outputs} = await this.transferTransaction(transferInfo);
    const configs = getChainConfigs();
    const { from } = transferInfo;
    const CROSS_INFO = configs.NULS;
    if (this.chain === "NERVE") {
      // nerve资产跨链到nuls,要收取nuls手续费
      let isNULS = false;
      const fee = timesDecimals(crossFee, 8);
      for (let input of inputs) {
        if (input.assetsChainId === CROSS_INFO.chainId && input.assetsId === CROSS_INFO.assetId) {
          //跨链资产为nuls
          isNULS = true;
          input.amount = Plus(input.amount, fee).toFixed();
        }
      }
      if (!isNULS) {
        // 跨链资产不是nuls
        const nonce = await this.getNonce(from, CROSS_INFO.chainId, CROSS_INFO.assetId);
        console.log("nonce*************");
        console.log(nonce);
        if (!nonce) {
          return {
            success: false,
            data: {from, assetsChainId: CROSS_INFO.chainId, assetsId: CROSS_INFO.assetId}
          };
        }
        inputs.push({
          address: from,
          assetsChainId: CROSS_INFO.chainId,
          assetsId: CROSS_INFO.assetId,
          amount: fee,
          locked: 0,
          nonce: nonce
        });
      }
    }
    return {inputs, outputs};
  }

  // 调用合约交易
  async callContractTransaction(transferInfo) {
    const config = getChainConfigs();
    const mainAsset = config.NULS;
    const { from, assetsChainId, assetsId, amount, toContractValue, to, nulsValueToOthers } = transferInfo;
    const nonce = await this.getNonce(from, mainAsset.chainId, mainAsset.assetId);
    const defaultFee = timesDecimals(0.001, 8);
    // const defaultFee = 0;
    const outputs = [];
    if (toContractValue) {
      outputs.push({
        address: to,
        assetsChainId,
        assetsId,
        amount: toContractValue,
        lockTime: 0
      });
    }
    let newAmount = Plus(amount, defaultFee).toFixed();
    if (nulsValueToOthers) {
      const length = nulsValueToOthers.length;
      for (let i = 0; i < length; i++) {
        const nulsValueToOther = nulsValueToOthers[i];
        newAmount = Plus(newAmount, nulsValueToOther.value).toFixed();
        outputs.push({
          address: nulsValueToOther.address,
          assetsChainId,
          assetsId,
          amount: nulsValueToOther.value,
          lockTime: 0
        });
      }
    }
    const inputs = [
      {
        address: from,
        assetsChainId,
        assetsId,
        amount: newAmount,
        locked: 0,
        nonce: nonce
      }
    ];
    return {inputs, outputs};
  }

  // nerve 提现
  async WithdrawalTransaction(transferInfo) {
    //console.log(transferInfo, 8888);
    const config = getChainConfigs();
    const mainAsset = config.NERVE;
    let nonce;
    const { from, assetsChainId, assetsId, amount, proposalPrice, fee } = transferInfo;
    if (transferInfo.nonce) {
      nonce = transferInfo.nonce
    } else {
      nonce = await this.getNonce(from, assetsChainId, assetsId);
    }
    const mainAssetNonce = await this.getNonce(from, mainAsset.chainId, mainAsset.assetId);
    let inputs = [];
    const totalFee = Number(Plus(proposalPrice, fee));
    if (
      mainAsset.chainId === assetsChainId &&
      mainAsset.assetId === assetsId
    ) {
      const newAmount = Number(Plus(amount, totalFee));
      inputs.push({
        address: from,
        amount: newAmount,
        assetsChainId,
        assetsId,
        nonce: nonce,
        locked: 0
      });
    } else {
      inputs = [
        {
          address: from,
          amount,
          assetsChainId,
          assetsId,
          nonce,
          locked: 0
        },
        {
          address: from,
          amount: totalFee,
          assetsChainId: mainAsset.chainId,
          assetsId: mainAsset.assetId,
          nonce: mainAssetNonce,
          locked: 0
        }
      ];
    }
    // 系统补贴手续费地址
    const feeAddress = mainAsset.config.feeAddress;
    const blockHoleAddress = mainAsset.config.destroyAddress;
    let outputs = [
      {
        address: blockHoleAddress, //黑洞地址
        amount,
        assetsChainId,
        assetsId,
        locked: 0
      },
      {
        address: feeAddress, //提现费用地址
        amount: proposalPrice,
        assetsChainId: mainAsset.chainId,
        assetsId: mainAsset.assetId,
        locked: 0
      }
    ];
    return {inputs, outputs};
  }

  async getNonce(address, assetChainId, assetId) {
    const assetInfo = await getNAssetInfo(this.chain, address, assetChainId, assetId);
    if (assetInfo) {
      return assetInfo.nonce;
    }
    return null;
  }

  async getAssetNerveInfo(data) {
    //console.log(data, 888999)
    let result = null;
    let params = {};
    if (data.contractAddress) {
      const config = getChainConfigs();
      const mainAsset = config[data.fromChain]; //来源链(eth,bnb,heco)主资产信息
      params = {chainId: mainAsset.chainId, contractAddress: data.contractAddress};
    } else {
      params = {chainId: data.assetsChainId, assetId: data.assetsId};
    }
    try {
      const res = await request({url: "/asset/nerve/chain/info", data: params});
      if (res.code === 1000) {
        result = res.data;
      }
    } catch (e) {
      console.error(e);
    }
    return result;
  }

}

const RPC_URL = {
  BSC: {
    ropsten: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    homestead: "https://bsc-dataseed.binance.org/"
  },
  Heco: {
    ropsten: "https://http-testnet.hecochain.com",
    homestead: "https://http-mainnet.hecochain.com"
  },
  OKExChain: {
    ropsten: "https://exchaintestrpc.okex.org",
    homestead: "https://exchainrpc.okex.org"
  },
  Harmony: {
    ropsten: "https://api.s0.b.hmny.io",
    homestead: "https://api.harmony.one"
  },
  Polygon: {
    ropsten: "https://rpc-mumbai.maticvigil.com",
    homestead: "https://rpc-mainnet.maticvigil.com"
  },
  KCC: {
    ropsten: "https://rpc-testnet.kcc.network",
    homestead: "https://rpc-mainnet.kcc.network"
  },
};

const CROSS_OUT_ABI = [
  "function crossOut(string to, uint256 amount, address ERC20) public payable returns (bool)",
  'function crossOutII(string to, uint256 amount, address ERC20, bytes data) public payable returns (bool)'
];
// token授权
const ERC20_ABI = [
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// 查询余额
const erc20BalanceAbiFragment = [{
  "constant": true,
  "inputs": [{"name": "", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "", "type": "uint256"}],
  "type": "function"
}]

// token转账
const erc20TransferAbiFragment = [{
  name: "transfer",
  type: "function",
  inputs: [{"name": "_to", "type": "address"}, {"type": "uint256", "name": "_tokens"}],
  constant: false,
  outputs: [],
  payable: false
}];

export class ETransfer {

  constructor(props = {}) {
    this.walletType = localStorage.getItem("walletType");
    this.getProvider(props.chain)
  }

  getProvider(chain) {
    if (!this.walletType) return null;
    const config = getChainConfigs();
    if (!chain) {
      this.provider = new ethers.providers.Web3Provider(window[this.walletType]);
    } else {
      if (chain === "Ethereum") {
        this.provider = ethers.getDefaultProvider(ETHNET);
      } else {
        // this.provider =  new ethers.providers.JsonRpcProvider(RPC_URL[chain][ETHNET]);
        this.provider =  new ethers.providers.JsonRpcProvider(config[chain].apiUrl);
      }
    }
  }

  decodeData(data) {
    /* const commonTransferABI = ["function transfer(address recipient, uint256 amount)"] // eth等链发起的交易
    // CROSS_OUT_ABI nerve链发起的跨链转入交易
    const ABI = fromNerve ? CROSS_OUT_ABI : commonTransferABI
    const iface = new ethers.utils.Interface(ABI);  */
    const iface = new ethers.utils.Interface(["function transfer(address recipient, uint256 amount)"]);
    const txInfo = iface.parseTransaction({data});
    //const decode = iface.functions["transfer(address,uint256)"].decode(data);
    // const decode = iface.decodeFunctionData("transfer(address,uint)", data);
    if (txInfo) {
      return {to: txInfo.args[0], amount: txInfo.args[1].toString()};
    }
    return null;
  }

  formatEther(value) {
    return ethers.utils.formatEther(value);
  }

  /**
   * metamask 跨链转入nerve
   * @param multySignAddress 多签地址
   * @param nerveAddress nerve地址
   * @param numbers 交易数量
   * @param fromAddress metamask地址
   * @param contractAddress ERC20合约地址
   * @param decimals token精度
   * @param gasPrice
   * @param gasLimit
   *
   */
  async crossIn(params) {
    const { multySignAddress, nerveAddress, numbers, fromAddress, contractAddress, decimals, gasPrice, gasLimit } = params;
    let transactionParameters;
    if (contractAddress) {
      // token 转入
      const numberOfTokens = ethers.utils.parseUnits(numbers, decimals);
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      const data = iface.functions.crossOut.encode([nerveAddress, numberOfTokens, contractAddress]);
      transactionParameters = {
        to: multySignAddress,
        from: fromAddress, //验证合约调用需要from,必传
        value: '0x00',
        data: data,
        gasPrice,
        gasLimit
      };
    } else {
      const amount = ethers.utils.parseEther(numbers).toHexString();
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      const data = iface.functions.crossOut.encode([nerveAddress, amount, '0x0000000000000000000000000000000000000000']);
      transactionParameters = {
        to: multySignAddress,
        value: amount,
        data: data,
        gasPrice,
        gasLimit
      };
    }
    const failed = await this.validate(transactionParameters);
    if (failed) {
      console.error('failed approveERC20' + failed);
      return {success: false, msg: 'failed crossIn' + failed}
    }
    // if (transactionParameters.from) {
    //   delete transactionParameters.from;
    // }
    transactionParameters.from = fromAddress;
    return await this.sendTransactionDirect(transactionParameters)
    // return await this.sendTransaction(transactionParameters)
  }

  /**
   * metamask 跨链转入nerve 支持多token和主资产一起转入
   * @param params.multySignAddress 多签地址
   * @param params.nerveAddress nerve地址
   * @param params.numbers 交易数量
   * @param params.fromAddress metamask地址
   * @param params.contractAddress ERC20合约地址
   * @param params.decimals token精度
   * @param params.gasLimit
   * @param params.crossChainFee
   * @param params.orderId
   * @param onlyTxData 是否只返回txData
   */
  async crossInII(params, onlyTxData = false) {
    const { multySignAddress, nerveAddress, numbers, fromAddress,
      contractAddress, decimals, gasLimit, crossChainFee, orderId } = params;
    if (!multySignAddress || !nerveAddress || !fromAddress) throw 'Invalid params'
    let mainAssetValue, data;
    const byteOrderId = ethers.utils.toUtf8Bytes(orderId);
    if (contractAddress) {
      // token 转入
      const numberOfTokens = ethers.utils.parseUnits(numbers, decimals);
      mainAssetValue = ethers.utils.parseEther(crossChainFee.toString());
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      data = iface.functions.crossOutII.encode([nerveAddress, numberOfTokens, contractAddress, byteOrderId]);
    } else {
      const allNumber = Plus(crossChainFee, numbers).toFixed();
      mainAssetValue = ethers.utils.parseEther(allNumber);
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      data = iface.functions.crossOutII.encode([nerveAddress, '0', '0x0000000000000000000000000000000000000000', byteOrderId]);
    }
    const transactionParameters = {
      from: fromAddress, //验证合约调用需要from,必传
      to: multySignAddress,
      value: mainAssetValue,
      data: data,
      gasLimit
    }
    console.log(transactionParameters, 999);
    if (onlyTxData) {
      delete transactionParameters.gasLimit;
      return transactionParameters;
    }
    const failed = await this.validate(transactionParameters);
    if (failed) {
      return { success: false, msg: 'failed crossInII' + failed };
    }
    delete transactionParameters.from;
    return await this.sendTransaction(transactionParameters);
  }

  // 组装跨链转入交易需要的txData
  getCrossInTxData(params) {
    const { multySignAddress, nerveAddress, numbers, fromAddress, contractAddress, decimals } = params;
    let transactionParameters;
    if (contractAddress) {
      // token 转入
      const numberOfTokens = ethers.utils.parseUnits(numbers, decimals);
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      const data = iface.functions.crossOut.encode([nerveAddress, numberOfTokens, contractAddress]);
      transactionParameters = {
        to: multySignAddress,
        from: fromAddress, //验证合约调用需要from,必传
        value: '0x00',
        data: data
      };
    } else {
      const amount = ethers.utils.parseEther(numbers).toHexString();
      const iface = new ethers.utils.Interface(CROSS_OUT_ABI);
      const data = iface.functions.crossOut.encode([nerveAddress, amount, '0x0000000000000000000000000000000000000000']);
      transactionParameters = {
        to: multySignAddress,
        value: amount,
        data: data
      };
    }
    return transactionParameters
  }

  // 普通链内转账
  async commonTransfer(params) {
    const wallet = await this.provider.getSigner();
    const nonce = await wallet.getTransactionCount();
    if (params.contractAddress) {
      const contract = new ethers.Contract(params.contractAddress, erc20TransferAbiFragment, wallet);
      const numberOfTokens = ethers.utils.parseUnits(params.value, params.decimals);
      const transaction = { nonce };
      /* console.log("to: ", params.to)
      console.log("numberOfTokens: ", numberOfTokens)
      console.log("transaction: ", transaction) */
      return await contract.transfer(params.to, numberOfTokens, transaction);
    } else {
      // 非token转账
      const value = ethers.utils.parseEther(params.value);
      const transaction = {nonce, to: params.to, value};
      /* if (params.upSpeed) {
        transaction.gasPrice = await this.getSpeedUpGasPrice();
      } */
      // console.log("transaction: ", transaction)
      return await wallet.sendTransaction(transaction);
    }
  }

  getEthBalance(address) {
    let balancePromise = this.provider.getBalance(address);
    return balancePromise.then((balance) => {
      return ethers.utils.formatEther(balance)
    }).catch(e => {
      // console.error('获取余额失败' + e)
      throw new Error("获取余额失败" + e)
    });
  }

  /**
 * ERC20合约余额
 * @param contractAddress ERC20合约地址
 * @param tokenDecimals token小数位数
 * @param address 账户地址
 */
  getERC20Balance(contractAddress, tokenDecimals, address) {
    let contract = new ethers.Contract(contractAddress, erc20BalanceAbiFragment, this.provider);
    let balancePromise = contract.balanceOf(address);
    return balancePromise.then((balance) => {
      console.log(balance, 123456)
      return ethers.utils.formatUnits(balance, tokenDecimals);
    }).catch(e => {
      // console.error('获取ERC20余额失败' + e)
      throw new Error("获取余额失败" + e)
    });
  }

  //验证交易参数
  async validate(tx) {
    try {
      const result = await this.provider.call(tx);
      return ethers.utils.toUtf8String("0x" + result.substr(138));
    } catch (e) {
      return false;
    }
  }

  // 使用web3发送交易， OEC发送token使用ethers解析hash报错
  async sendTransactionDirect(tx) {
    console.log(tx)
    const web3 = new Web3(window[this.walletType]);
    return new Promise((resolve, reject) => {
      web3.eth.sendTransaction(tx, function(err, hash) {
        console.log(err, hash, "----callback----")
        if (err) {
          reject(err)
        } else {
          resolve({hash})
        }
      })
    })
  }

  async sendTransaction(tx) {
    const wallet = this.provider.getSigner();
    return await wallet.sendTransaction(tx);
  }


  /**
   * 查询erc20资产授权额度
   * @param contractAddress ERC20合约地址
   * @param multySignAddress 多签地址
   * @param address 账户eth地址
   * @param currentAmount 需要授权的数量
   */
  async getERC20Allowance(contractAddress, multySignAddress, address, currentAmount) {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
    const allowancePromise = contract.allowance(address, multySignAddress);
    return allowancePromise
        .then(allowance => {
          console.log(allowance.toString(), Minus(currentAmount || 0, allowance) >= 0, '==allowance==');
          return Minus(currentAmount || 0, allowance) > 0 || Minus(currentAmount || 0, allowance) === 0;
        })
        .catch(e => {
          console.error('获取erc20资产授权额度失败' + e);
          return true;
        });
  }

  async approveERC20(contractAddress, multySignAddress, address) {
    const iface = new ethers.utils.Interface(ERC20_ABI);
    const data = iface.functions.approve.encode([multySignAddress, new ethers.utils.BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')]);
    const transactionParameters = {
      to: contractAddress,
      from: address,
      value: '0x00',
      data: data,
    };
    const failed = await this.validate(transactionParameters);
    if (failed) {
      console.error('failed approveERC20' + failed);
      return {success: false, msg: 'failed approveERC20' + failed}
    }
    delete transactionParameters.from;   //etherjs 4.0 from参数无效 报错
    return this.sendTransaction(transactionParameters)
  }


  // 获取手续费
  getGasPrice(gasLimit) {
    return this.provider.getGasPrice().then(gasPrice => {
      return ethers.utils.formatEther(gasPrice.mul(gasLimit).toString()).toString();
    });
  }

  // 加速手续费
  async getSpeedUpFee(gasLimit) {
    const gasPrice = await this.getSpeedUpGasPrice();
    return ethers.utils.formatEther(gasPrice.mul(gasLimit).toString()).toString();
  }

  // 加速gasprice
  getSpeedUpGasPrice() {
    const GWEI_10 = ethers.utils.parseUnits("10", 9);
    return this.provider.getGasPrice().then(gasPrice => {
      return gasPrice.add(GWEI_10);
    });
  }

  // 预估交易需要的gas
  estimateGas(tx) {
    return this.provider.estimateGas(tx).then(gasLimit => {
      // 预估基础上 * 1.5
      return gasLimit.mul(15).div(10);
    });
  }

  /**
   * 提现默认手续费--nvt
   * @param nvtUSD    nvt的USDT价格
   * @param heterogeneousChainUSD    异构链币种的USDT价格
   * @param isToken   是否token资产
   */
  async calWithdrawalNVTFee(nvtUSD, heterogeneousChainUSD, isToken) {
    // console.log(nvtUSD, heterogeneousChainUSD, isToken);
    const gasPrice = await this.getWithdrawGas();
    let gasLimit;
    if (isToken) {
      gasLimit = new ethers.utils.BigNumber("210000");
    } else {
      gasLimit = new ethers.utils.BigNumber("190000");
    }
    const configs = getChainConfigs();
    if (configs.Arbitrum) {
      // arbi网络特殊处理gasLimit
      const isArbi = Number(this.provider.network.chainId) === Number(configs.Arbitrum.nativeId);
      if (isArbi) {
        gasLimit = new ethers.utils.BigNumber("4000000");
      }
    }
    const nvtUSDBig = ethers.utils.parseUnits(nvtUSD, 6);
    const ethUSDBig = ethers.utils.parseUnits(heterogeneousChainUSD, 6);
    const result = ethUSDBig.mul(gasPrice).mul(gasLimit).div(ethers.utils.parseUnits(nvtUSDBig.toString(), 10));
    // console.log('result: ' + result.toString());
    const numberStr = ethers.utils.formatUnits(result, 8).toString();
    const ceil = Math.ceil(numberStr);
    // console.log('ceil: ' + ceil);
    const finalResult = ethers.utils.parseUnits(ceil.toString(), 8);
    // console.log('finalResult: ' + finalResult);
    return finalResult;
  }

  // 提现gas
  getWithdrawGas() {
    return this.provider.getGasPrice().then(gasPrice => {
      return gasPrice;
    });
  }

  /**
   * 计算提现手续费  eth/bnb
   */
  async calWithdrawFee(isToken) {
    const gasPrice = await this.getWithdrawGas();
    let gasLimit;
    if (isToken) {
      gasLimit = new ethers.utils.BigNumber("210000");
    } else {
      gasLimit = new ethers.utils.BigNumber("190000");
    }
    // console.log(gasPrice);
    // console.log(gasLimit);
    const result = gasLimit.mul(gasPrice);
    const finalResult = ethers.utils.formatEther(result);
    // console.log('finalResult: ' + finalResult);
    return finalResult.toString();
  }

  /**
   * @desc 计算提现时使用其他网络主资产充当手续费时的费用
   * @param mainAssetUSD 提现网络主资产USD
   * @param feeUSD 手续费USD
   * @param isToken 提现资产是否是token
   * @param feeDecimals 手续费精度
   * @param isMainAsset 手续费是否是提现网络主资产
   * @param isNVT 手续费是否是NVT
   * */
  async calWithdrawalFee(mainAssetUSD, feeUSD, isToken, feeDecimals, isMainAsset = false, isNVT = false) {
    const gasPrice = await this.getWithdrawGas();
    let gasLimit;
    if (isToken) {
      gasLimit = new ethers.utils.BigNumber("210000");
    } else {
      gasLimit = new ethers.utils.BigNumber("190000");
    }
    if (isMainAsset) {
      return this.formatEthers(gasLimit.mul(gasPrice), feeDecimals);
    }
    const feeUSDBig = ethers.utils.parseUnits(feeUSD.toString(), 6);
    const mainAssetUSDBig = ethers.utils.parseUnits(mainAssetUSD.toString(), 6);
    let result = mainAssetUSDBig
      .mul(gasPrice)
      .mul(gasLimit)
      .mul(ethers.utils.parseUnits("1", feeDecimals))
      .div(ethers.utils.parseUnits("1", 18))
      .div(feeUSDBig);
    if (isNVT) {
      // 如果是nvt，向上取整
      const numberStr = ethers.utils.formatUnits(result, feeDecimals);
      const ceil = Math.ceil(numberStr);
      result = ethers.utils.parseUnits(ceil.toString(), feeDecimals).toString();
    }
    return this.formatEthers(result, feeDecimals);
  }

  formatEthers(amount, decimals) {
    return ethers.utils.formatUnits(amount, decimals).toString();
  }

  /**
   * 通过自定义的eth/bnb数量 计算出相应的nvt数量
   * @param nvtUSD                            nvt的USDT价格
   * @param number                           异构链币种数量
   * @param heterogeneousChainUSD      异构链币种的USDT价格
   */
  calNvtByEth(nvtUSD, number, heterogeneousChainUSD) {
    let ethAmount = ethers.utils.parseEther(number);
    // console.log('ethAmount: ' + ethAmount.toString());
    let nvtUSDBig = ethers.utils.parseUnits(nvtUSD, 6);
    let ethUSDBig = ethers.utils.parseUnits(heterogeneousChainUSD, 6);
    let result = ethAmount.mul(ethUSDBig).div(ethers.utils.parseUnits(nvtUSDBig.toString(), 10));
    // console.log('result: ' + result.toString());
    // console.log('result format: ' + ethers.utils.formatUnits(result, 8));
    let numberStr = ethers.utils.formatUnits(result, 8).toString();
    let ceil = Math.ceil(numberStr);
    // console.log('ceil: ' + ceil);
    let finalResult = ethers.utils.parseUnits(ceil.toString(), 8);
    // console.log('finalResult: ' + finalResult);
    return finalResult.toString();
  }

  async getPubBySign(message, address) {
    let signature;
    if (this.walletType === 'NaboxWallet') {
      const jsonRpcSigner = this.provider.getSigner();
      signature = await jsonRpcSigner.signMessage(message);
    } else {
      signature = await window[this.walletType].request({
        method: "personal_sign",
        params: [message, address]
      })
    }
    const msgHash = ethers.utils.hashMessage(message);
    const msgHashBytes = ethers.utils.arrayify(msgHash);
    const recoveredPubKey = ethers.utils.recoverPublicKey(
      msgHashBytes,
      signature
    );
    if (recoveredPubKey.startsWith("0x04")) {
      const compressPub = ethers.utils.computePublicKey(
        recoveredPubKey,
        true
      );
      return compressPub.slice(2);
    } else {
      throw 'sign error';
    }
  }
}

export async function getSymbolUSD(chain) {
  const res = await request({
    url: "/asset/main/price",
    data: {chain}
  });
  if (res.code === 1000) {
    return res.data;
  }
  return null;
}

export const swapScale = 2; // 闪兑数量/提现数量比例

export const swapSymbolConfig = {
  ETH: "ETH",
  BNB: "BNB(BSC)",
  HT: "HT(HECO)",
  OKT: "OKT(OKT)",
  NULS: "NULS"
}

export async function reportError(txHash, errMsg) {
  const res = await request({
    url: "/tx/bridge/log",
    data: {
      txHash,
      log: JSON.stringify(errMsg)
    }
  });
}

export const gasLimitConfig = {
  default: 35000,
  token: 150000
}

// 查询eth系列资产余额
export async function getEVMBalance(chain, address, contractAddress, tokenDecimals) {
  try {
    const configs = getChainConfigs();
    const apiUrl = configs[chain].apiUrl;
    const provider = new ethers.providers.JsonRpcProvider(apiUrl);
    if (contractAddress) {
      const contract = new ethers.Contract(contractAddress, erc20BalanceAbiFragment, provider);
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, tokenDecimals);
    } else {
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance)
    }
  } catch (e) {
    return 0
  }
}

// 查询nuls/nerve系列资产详情
export async function getNAssetInfo(chain, address, assetChainId, assetId, contractAddress) {
  try {
    const configs = getChainConfigs();
    const chainInfo = configs[chain];
    let result;
    if (contractAddress) {
      result = await post(chainInfo.apiUrl, 'getTokenBalance', [chainInfo.chainId, contractAddress, address]);
    } else {
      result = await post(chainInfo.apiUrl, 'getAccountBalance', [chainInfo.chainId, assetChainId, assetId, address])
    }
    return result && result.result || null
  } catch (e) {
    return null
  }
}

// 查询nuls/nerve系列资产余额
export async function getNBalance(chain, address, assetChainId, assetId, contractAddress, tokenDecimals) {
  const assetInfo = await getNAssetInfo(chain, address, assetChainId, assetId, contractAddress);
  if (assetInfo) {
    const amount = assetInfo.balance || assetInfo.amount
    return divisionAndFix(amount, tokenDecimals)
  }
  return 0;
}
