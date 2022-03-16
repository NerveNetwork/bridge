// 后台添加多条链后，本地存储的账户地址没有同步新添加的链的地址

import {request} from '@/api/https'
import nerve from "nerve-sdk-js";
import { ethers } from "ethers";
import { MAIN_INFO, NULS_INFO } from "@/config";


//使用pub重新生成一遍账户
function generateAddress(pub, config) {
  const address = getHeterogeneousAddress(pub, config)
  address.NERVE = nerve.getAddressByPub(
      MAIN_INFO.chainId,
      MAIN_INFO.assetId,
      pub,
      MAIN_INFO.prefix
  );
  address.NULS = nerve.getAddressByPub(
      NULS_INFO.chainId,
      NULS_INFO.assetId,
      pub,
      NULS_INFO.prefix
  );
  return address;
}

// 生成异构网络地址
function getHeterogeneousAddress(pub, config) {
  const ercAddress = ethers.utils.computeAddress(ethers.utils.hexZeroPad(ethers.utils.hexStripZeros('0x' + pub), 33));
  const address = {}
  for(let chain in config) {
    if (chain !== 'NULS' && chain !== 'NERVE') {
      address[chain] = ercAddress
    }
  }
  return address
}

function isDiffAccount(config, account) {
  const configChains = Object.keys(config);
  const currentChains = Object.keys(account.address);
  return !configChains.every(chain => {
    return currentChains.includes(chain)
  })
  // const addressLength = Object.keys(config).length;
  // const currentAddressLength = Object.keys(account.address).length;
  // return addressLength !== currentAddressLength
}

export async function syncAccount(pubKey, addressInfo) {
  const addressList = Object.keys(addressInfo).map(chain => {
    return {
      chain,
      address: addressInfo[chain]
    }
  })
  const res = await request({
    url: "/wallet/sync",
    data: { pubKey, addressList }
  });
  if (res.code !== 1000) {
    throw 'Sync account error'
  }
}

export async function hackAddChain(config) {
  try {
    const accountList = JSON.parse(localStorage.getItem('accountList')) || [];
    if (accountList.length) {
      let flag = false
      for (let i = 0; i < accountList.length; i++) {
        const account = accountList[i];
        const { address, pub } = account
        const keys = Object.keys(address)
        const isBugAccount = !!keys.every(key => {
          return !isNaN(Number(key))
        });
        console.log(isBugAccount, "-----", isDiffAccount(config, account))
        if (isBugAccount || isDiffAccount(config, account)) {
          flag = true
          account.address = generateAddress(pub, config);
          await syncAccount(account.pub, account.address)
        }
      }
      if (flag) {
        console.log(accountList, 363636)
        localStorage.setItem('accountList', JSON.stringify(accountList))
      }
      /*const addressLength = Object.keys(config).length;
      if (!addressLength) return;
      const hasNewChain = accountList.some(account => {
        return isDiffAccount(config, account)
      })
      // 当前生成的多链地址数量和配置的多链数量不一致
      if (hasNewChain) {
        for (let i = 0; i < accountList.length; i++) {
          const account = accountList[i];
          if (isDiffAccount(config, account)) {
            account.address = generateAddress(config, {...account.address});
            // 重新同步账户数据
            await syncAccount(account.pub, account.address)
          }
        }
        localStorage.setItem('accountList', JSON.stringify(accountList))
      }*/
    }
  } catch (e) {
    console.log(e, 666)
    setTimeout(() => {
      hackAddChain(config)
    }, 3000)
  }
}


