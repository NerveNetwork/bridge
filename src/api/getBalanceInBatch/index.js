import Web3 from "web3";
import { MultiCall } from "./Multicall/index"; // https://www.npmjs.com/package/eth-multicall
import { post } from '@/api/https'
import { isBeta } from '@/api/util';
import { getCustomTronWeb } from '@/api/tronApi';

// evm批量查询余额abi
const erc20BalanceAbiFragment = [
  {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "inputs":[
      {
        "internalType":"address",
        "name":"addr",
        "type":"address"
      }
    ],
    "name":"getEthBalance",
    "outputs":[
      {
        "internalType":"uint256",
        "name":"balance",
        "type":"uint256"
      }
    ],
    "stateMutability":"view",
    "type":"function"
  }
]

// tron批量查询余额abi
const trc20ABI = {
  "outputs": [{"name": "info", "type": "uint256[]"}],
  "constant": true,
  "inputs": [{"name": "_user", "type": "address"}, {"name": "_tokens", "type": "address[]"}],
  "name": "getBalance",
  "stateMutability": "view",
  "type": "function"
};
/**
 * 批量查询L1网络资产余额
 * @param contractList 需要查询的合约资产地址list
 * @param userAddress 用户L1网络地址
 * @param multiCallAddress 当前L1网络下面的批量查询合约地址
 * @param rpcUrl 当前L1网络RPC
 * @returns tokensRes {Promise<*>} 当前返回的批量查询数据
 */
export async function getERC20AssetsBalance(contractList, userAddress, multiCallAddress, rpcUrl) {
  try {
    const web3 = new Web3(rpcUrl);
    const multiCall = new MultiCall(web3, multiCallAddress);
    const tokens = contractList.map(contract => {
      const token = new web3.eth.Contract(erc20BalanceAbiFragment, contract);
      return {
        balance: contract === multiCallAddress ? token.methods.getEthBalance(userAddress) : token.methods.balanceOf(userAddress),
        symbol: contract === multiCallAddress ? '' : token.methods.symbol(),
        contractAddress: contract === multiCallAddress ? '' : contract,
        decimals: contract === multiCallAddress ? '' : token.methods.decimals()
      }
    });
    const [tokensRes] = await multiCall.all([tokens]);
    return tokensRes;
  } catch (e) {
    console.log(e, 132)
    return []
  }
}


/**
 * 批量查询nuls、nerve链上资产余额
 *  @param url 接口url
 *  @param chainId 链Id
 *  @param address nuls|nerve地址
 *  @param assetsInfo 资产列表
 *        nerve上 [
 *           { chainId: 5, assetId: 1 },
 *           { chainId: 5: assetId: 104 },
 *         ]
 *         nuls上 [
 *          { chainId: 2, assetId: 1, contractAddress: "" },
 *          { chainId: 2: assetId: 0, contractAddress: "tNULSeBaMzvqHiyBnr7c1TKYBLMHMvi1CcisAg" },
 *        ]
 */
export async function getNAssetsBalance(url, chainId, address, assetsInfo) {
  const res = await post(url, "getBalanceList", [chainId, address, assetsInfo]);
  return res.result || []
}

/**
 * 批量查询TRON网络资产余额
 * @param contractList 需要查询的合约资产地址list
 * @param userAddress 用户L1网络地址
 * @param rpcUrl 当前L1网络RPC
 * @returns tokensRes {Promise<*>} 当前返回的批量查询数据
 */

export const defaultTRXSender = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';

const tronMultiCallAddress = isBeta ? 'TCmNMtJQiPpSKiGuXUj4vcJAGKqJstmsBD' : 'TCNYd8L5hBey9FwPpvgtvDaY2cHjMFVLZu';

export async function getTRC20AssetsBalance(contractList, userAddress, rpcUrl) {
  try {
    // trongrid == 'https://api.trongrid.io' // 414edb3b591c27aa3efe30f267690bf7ff2556d85c
    // shasta == 411a5a32bd07c33cd8d9f4bd158f235613480c7eef
    /*const instance = await window.tronWeb.contract().at('411a5a32bd07c33cd8d9f4bd158f235613480c7eef');
    return await instance.getBalance(userAddress, contractList).call();*/
    // debugger
    const tronWeb = getCustomTronWeb();
    const senderHex = addressToHex(defaultTRXSender);
    const contractAddressCall = addressToHex(tronMultiCallAddress);
    const params = [];
    params.push({ type: 'address', value: userAddress });
    params.push({ type: 'address[]', value: contractList });
    // debugger
    const tx = await tronWeb.transactionBuilder.triggerConstantContract(
      contractAddressCall,
      'getBalance(address,address[])',
      {},
      params,
      senderHex
    );

    const constantResult = tx.constant_result;
    if (!constantResult) {
      return [];
    }
    const output = '0x' + constantResult[0];
    const result = tronWeb.utils.abi.decodeParamsV2ByABI(trc20ABI, output);
    if (!result || result.length == 0) {
      return [];
    }
    const arr = result[0];
    const values = [];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]._hex;
      if (value) {
        values.push(value.toString())
      } else {
        values.push(arr[i].toString());
      }
    }
    return values;
  } catch (e) {
    console.log(e, 132)
    return []
  }
}

function addressToHex(tronAddress) {
  if (!tronAddress) {
    return "EMPTY ADDRESS!"
  }
  return window.tronWeb.address.toHex(tronAddress);
}
