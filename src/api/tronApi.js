import { getChainConfigs } from '@/api/util';

const TronWeb = require('tronweb');
//官方文档地址： https://cn.developers.tron.network/reference#address
import { Division, divisionDecimals, isBeta, Minus, Plus, Times, timesDecimals } from '@/api/util';

// const ethers = require('ethers');
import { ethers, utils } from 'ethers';

const trxWithdrawFee = 40000000;

/*const fullNode = isBeta
  ? 'https://api.shasta.trongrid.io'
  : 'https://api.trongrid.io';
const solidityNode = isBeta
  ? 'https://api.shasta.trongrid.io'
  : 'https://api.trongrid.io';
const eventServer = isBeta
  ? 'https://api.shasta.trongrid.io'
  : 'https://api.trongrid.io';
const privateKey =
  '138a22c03039e688daa2b7c785d1e8d6b9375d4413e6ea82471b1e7a61701a9d';
const customTronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer,
  ''
);*/
// customTronWeb.setHeader({ "TRON-PRO-API-KEY": '1355e44a-205d-4264-b4f6-76a3515aaec4' });

const CROSS_OUT_ABI = [
  'function crossOut(string to, uint256 amount, address ERC20) public payable returns (bool)'
];

const TRC20_ALLOWANCE_ABI = [
  {
    inputs: [
      {internalType: 'address', name: 'owner', type: 'address'},
      {internalType: 'address', name: 'spender', type: 'address'}
    ],
    name: 'allowance',
    outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function'
  }
];

export function generateTronAddress(pub) {
  const config = getChainConfigs();
  const rpcUrl = config.TRON.apiUrl;
  const customTronWeb = new TronWeb(
    rpcUrl,
    rpcUrl,
    rpcUrl,
    ''
  );
  pub = pub.startsWith('0x') ? pub : '0x' + pub;
  const unCompressPub = ethers.utils.computePublicKey(
    ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(pub), 33),
    false
  );
  const addressArray = customTronWeb.utils.crypto.computeAddress(
    customTronWeb.utils.code.hexStr2byteArray(unCompressPub.slice(2))
  );
  return customTronWeb.address.fromHex(
    customTronWeb.utils.code.byteArray2hexStr(addressArray)
  );
}

class TronLinkApi {
  constructor(pub) {
    this.initCustomTronWeb();
    if (pub) {
      this.selectedAddress = this.generateAddressByPub(pub);
    } else {
      this.hasTronLink = !!window.tronWeb;
      this.connected = this.isReady();
      this.selectedAddress = this.connected
        ? window.tronWeb.defaultAddress.base58
        : '';
      // console.log(window.tronWeb)
      this.getProvider();
    }
  }
  initCustomTronWeb() {
    const config = getChainConfigs();
    const rpcUrl = config.TRON.apiUrl;
    this.customTronWeb = new TronWeb(
      rpcUrl,
      rpcUrl,
      rpcUrl,
      ''
    );
  }

  isReady() {
    return window.tronWeb && window.tronWeb.ready;
  }

  getProvider() {
    if (this.connected) {
      this.provider = window.tronWeb;
    }
  }

  generateAddressByPub(pub) {
    return generateTronAddress(pub);
  }

  async requestAccount() {
    // if (!window.tronWeb) throw 'No provider was found';
    // if (!window.tronWeb.ready) throw 'Pls login first';
    if (this.connected) {
      return window.tronWeb.defaultAddress.base58;
    }
    let address;
    const res = await window.tronWeb.request({
      method: 'tron_requestAccounts'
    });
    if (res.code === 200) {
      address = window.tronWeb.defaultAddress.base58;
    }
    this.selectedAddress = address;
    return address;
  }

  async getBlockHeight() {
    const tronWeb = this.getTronWeb();
    const block = await tronWeb.trx.getCurrentBlock('');
    if (block && block.block_header) {
      // console.log(block.block_header.raw_data.number, 1111)
      return block.block_header.raw_data.number;
    } else {
      throw 'get block error';
    }
    // const height = await tronWeb.trx.getBlockByHash(block.blockID)
    // console.log(height, 96633333)
  }

  getTronWeb(pri) {
    if (this.provider) {
      return this.provider;
    } else {
      if (pri) {
        this.customTronWeb.setPrivateKey(pri);
      }
      return this.customTronWeb;
    }
  }

  validAddress(address) {
    const tronWeb = this.getTronWeb();
    return tronWeb.isAddress(address);
  }

  async getTrxBalance(address) {
    // console.log(address, '8777');
    const tronWeb = this.getTronWeb();

    const balance = await tronWeb.trx.getBalance(address);
    return divisionDecimals(balance, 6);
  }

  /**
   * @param address TRX地址
   * @param contractAddress 合约地址
   * @param decimals 资产精度
   * */
  async getTrc20Balance(address, contractAddress, decimals = 6) {
    const tronWeb = this.getTronWeb();
    const parameter = [{type: 'address', value: address}];
    const tx =
      await tronWeb.transactionBuilder.triggerConfirmedConstantContract(
        // tronWeb.address.toHex(contractAddress),
        contractAddress,
        'balanceOf(address)',
        {},
        parameter,
        this.selectedAddress
      );
    const balance = tx.constant_result[0]; //十六进制余额
    const balance_bignumber = tronWeb.toBigNumber('0x' + balance).toString();
    // console.log(balance_bignumber, 123)
    return divisionDecimals(balance_bignumber, decimals);
  }

  async sendTrx(to, amount, pri) {
    if (!this.validAddress(to)) {
      throw 'invalid address';
    }
    const tronWeb = this.getTronWeb(pri);
    const amount_bigNumber = timesDecimals(amount, 6);
    const tx = await tronWeb.transactionBuilder.sendTrx(
      to,
      amount_bigNumber,
      this.selectedAddress
    );
    const signedTx = await tronWeb.trx.sign(tx);
    return await tronWeb.trx.sendRawTransaction(signedTx);
  }

  async sendTrc20(to, amount, contractAddress, decimals, pri) {
    if (!this.validAddress(to)) {
      throw 'invalid address';
    }
    const tronWeb = this.getTronWeb(pri);
    const amount_bigNumber = timesDecimals(amount, decimals);
    const parameter = [
      {type: 'address', value: to},
      {type: 'uint256', value: amount_bigNumber}
    ];
    const tx = await tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(contractAddress),
      'transfer(address,uint256)',
      {},
      parameter,
      tronWeb.address.toHex(this.selectedAddress)
    );
    const signedTx = await tronWeb.trx.sign(tx.transaction);
    return await tronWeb.trx.sendRawTransaction(signedTx);
  }

  /** 跨链转入到nerve 支持trx和token同时转入
   * @param to nerve 地址
   * @param amount 转账数量
   * @param multySignAddress 多签地址
   * @param contractAddress 合约地址，trx传空
   * @param decimals 资产精度
   * @param orderId 订单编号
   * @param extraFee 跨链额外手续费
   * @param pri
   * */
  async crossOutToNerve(to, amount, multySignAddress, contractAddress, decimals = 6, orderId, extraFee, pri) {
    if (
      !this.validAddress(multySignAddress) ||
      (contractAddress && !this.validAddress(contractAddress))
    ) {
      throw 'invalid address';
    }
    const tronWeb = this.getTronWeb(pri);
    const byteOrderId = ethers.utils.toUtf8Bytes(orderId);
    let mainAssetValue, tokenAmount;
    if (contractAddress) {
      mainAssetValue = timesDecimals(extraFee, 6);
      tokenAmount = timesDecimals(amount, decimals);
    } else {
      contractAddress = '0x0000000000000000000000000000000000000000';
      const allNumber = Plus(extraFee, amount).toFixed();
      mainAssetValue = timesDecimals(allNumber, 6);
      tokenAmount = '0';
    }
    const instance = await tronWeb.contract().at(multySignAddress);
    console.log(instance, 132)
    return await instance.crossOutII(to, tokenAmount, contractAddress, byteOrderId).send({
      // feeLimit:100_000_000,
      callValue: mainAssetValue,
      shouldPollResponse: false
    });
  }

  /**
   * @desc 计算跨链转入手续费
   * @param from 调用者tron地址
   * @param to nerve 地址
   * @param amount 转账数量
   * @param multySignAddress 多签地址
   * @param contractAddress 合约地址，trx传空
   * @param decimals 资产精度
   * @param orderId 订单编号
   * @param extraFee 跨链额外手续费
   *
   */
  async getCrossInFee(from, to, amount, multySignAddress, contractAddress, decimals = 6, orderId, extraFee) {
    const tronWeb = this.getTronWeb();
    const byteOrderId = ethers.utils.toUtf8Bytes(orderId);
    let tokenAmount;
    if (contractAddress) {
      tokenAmount = timesDecimals(amount, decimals);
    } else {
      contractAddress = '0x0000000000000000000000000000000000000000';
      tokenAmount = '0';
    }
    const functionDes = 'crossOutII(string,uint256,address,bytes)';
    contractAddress =
      contractAddress || '0x0000000000000000000000000000000000000000';
    const parameter = [
      { type: 'string', value: to },
      { type: 'uint256', value: tokenAmount },
      { type: 'address', value: contractAddress },
      { type: 'bytes', value: byteOrderId }
    ]
    // console.log(multySignAddress, functionDes, {callValue: 1000000},
    //   parameter, from, '==--==');
    // const transaction = await tronWeb.transactionBuilder.triggerConstantContract(multySignAddress, functionDes, {callValue: 1000000}, parameter, from);
    // console.log(transaction, 888, decimals, divisionDecimals(transaction.energy_used * 280, 6));
    const parameters = this.getParams(parameter); // 自己组装参数调用rpc，triggerConstantContract无法计算energy_used
    const args = {
      contract_address: this.toHex(multySignAddress),
      function_selector: functionDes,
      owner_address: this.toHex(from),
      call_value: 1000000,
      fee_limit: 150000000,
      parameter: parameters,
      // call_value: 0,
      chainType: 0,
      visible: false,
    };
    const tx = await tronWeb.fullNode.request(`wallet/triggerconstantcontract`, args, 'post');
    console.log(tx);
    if (tx.result.code === 'CONTRACT_VALIDATE_ERROR') {
      throw 'Failed to calculate fee';
    } else {
      const gas_used = tx.energy_used || 0;
      return divisionDecimals(gas_used * 280, 6)
    }
  }

  // 查询跨链转入手续费参数组装
  getParams(parameters) {
    if (parameters.length) {
      const abiCoder = new utils.AbiCoder();
      let types = [];
      const values = [];

      for (let i = 0; i < parameters.length; i++) {
        let {type, value} = parameters[i];
        if (!type || !this.isString(type) || !type.length)
          throw('Invalid parameter type provided: ' + type);

        const ADDRESS_PREFIX_REGEX = /^(41)/;
        if (type === 'address')
          value = this.toHex(value).replace(ADDRESS_PREFIX_REGEX, '0x');
        else if (type.match(/^([^\x5b]*)(\x5b|$)/)[0] === 'address[')
          value = value.map(v => this.toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));

        types.push(type);
        values.push(value);
      }

      try {
        // workaround for unsupported trcToken type
        types = types.map(type => {
          if (/trcToken/.test(type)) {
            type = type.replace(/trcToken/, 'uint256')
          }
          return type
        })

        parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');

      } catch (ex) {
        throw ex;
      }
    } else parameters = '';
    return parameters;
  }
  toHex(value) {
    return this.getTronWeb().address.toHex(value);
  }

  isString(string) {
    return typeof string === 'string' || (string && string.constructor && string.constructor.name === 'String');
  }

  /**
   * @desc 手动转入方式
   * @param amount 转账数量
   * @param multySignAddress 多签地址
   * @param contractAddress 合约地址，trx传空
   * @param decimals 资产精度
   * @param pri
   * */
  async crossOutToNerveManual(amount, multySignAddress, contractAddress, decimals = 6, pri) {
    if (contractAddress) {
      return this.sendTrc20(
        multySignAddress,
        amount,
        contractAddress,
        decimals,
        pri
      );
    } else {
      return this.sendTrx(multySignAddress, amount, pri);
    }
  }

  /**
   * @desc 查询token授权情况
   * @param address TRX地址
   * @param multySignAddress 多签地址
   * @param contractAddress 合约地址
   * @param pri
   * */
  async getTrc20Allowance(address, multySignAddress, contractAddress, pri) {
    const tronWeb = this.getTronWeb(pri);
    const instance = await tronWeb.contract(
      TRC20_ALLOWANCE_ABI,
      contractAddress
    );
    // console.log(instance, 9696)
    const allowance = await instance
      .allowance(address, multySignAddress)
      .call();
    const baseAllowance = '39600000000000000000000000000';
    // @ts-ignore
    return Minus(baseAllowance, allowance.toString()) >= 0;
  }

  async approveTrc20(address, multySignAddress, contractAddress, pri) {
    if (
      !this.validAddress(multySignAddress) ||
      (contractAddress && !this.validAddress(contractAddress))
    ) {
      throw 'invalid address';
    }
    const tronWeb = this.getTronWeb(pri);
    const instance = await tronWeb.contract().at(contractAddress);
    const approveAmount = tronWeb
      .toBigNumber(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
      .toFixed();
    return await instance.approve(multySignAddress, approveAmount).send({
      // feeLimit:100_000_000,
      callValue: 0,
      shouldPollResponse: false
    });
  }

  calWithdrawalNVT(nvtUSD, heterogeneousChainUSD) {
    const defaultTRX = divisionDecimals(trxWithdrawFee, 6);
    const nvtAmount = Division(
      Times(heterogeneousChainUSD, defaultTRX),
      nvtUSD
    ).toFixed();
    // @ts-ignore
    return Math.ceil(nvtAmount);
  }

  async getTxInfo(hash) {
    const tronWeb = this.getTronWeb();
    const res = await tronWeb.trx.getTransaction(hash);
    console.log(res, 666666666);
  }

  async getPubBySign(message) {
    const tronWeb = this.getTronWeb();
    const messageHex = tronWeb.toHex(message);
    const signature = await tronWeb.trx.sign(messageHex);
    const TRX_MESSAGE_HEADER = '\x19TRON Signed Message:\n32';
    const messageBytes = [
      ...ethers.utils.toUtf8Bytes(TRX_MESSAGE_HEADER),
      ...ethers.utils.arrayify(messageHex)
    ];
    const msgHash = ethers.utils.keccak256(messageBytes);
    const msgHashBytes = ethers.utils.arrayify(msgHash);
    const recoveredPubKey = ethers.utils.recoverPublicKey(
      msgHashBytes,
      signature
    );
    if (recoveredPubKey.startsWith('0x04')) {
      const compressPub = ethers.utils.computePublicKey(recoveredPubKey, true);
      return compressPub.slice(2);
    } else {
      throw 'Sign error';
    }
  }
}

export default TronLinkApi;
