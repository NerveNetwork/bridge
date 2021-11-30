import Web3 from "web3";
import { MultiCall } from "./Multicall/index"; // https://www.npmjs.com/package/eth-multicall
import { post } from '@/api/https'
import { MAIN_INFO, NULS_INFO } from "@/config"

// 查询余额
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
    // const walletType = localStorage.getItem("walletType")
    // const web3 = new Web3(window[walletType]);
    const multiCall = new MultiCall(web3, multiCallAddress);
    // console.log(contractList, userAddress, 6666333322, multiCallAddress)
    const tokens = contractList.map(address => {
      const token = new web3.eth.Contract(erc20BalanceAbiFragment, address);
      return {
        balance: address === multiCallAddress ? token.methods.getEthBalance(userAddress) : token.methods.balanceOf(userAddress),
        symbol: address === multiCallAddress ? '' : token.methods.symbol(),
        contractAddress: address === multiCallAddress ? '' : address,
        decimals: address === multiCallAddress ? '' : token.methods.decimals()
      }
    });
    /*const token = new web3.eth.Contract(erc20BalanceAbiFragment, "0x04f8e3b9a7de4d3f90a0bd34325c35433d94482d");
    const tokens = [{
      balance: token.methods.balanceOf(userAddress), //token.methods.getEthBalance(userAddress),
      symbol: token.methods.symbol(),
      contractAddress: "0x04f8e3b9a7de4d3f90a0bd34325c35433d94482d",
      decimals: token.methods.decimals()
    }]
    console.log(tokens, 4564564)*/
    const [tokensRes] = await multiCall.all([tokens]);
    // tokensRes.map(v => {
    //   v.available = v.balance
    // })
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
