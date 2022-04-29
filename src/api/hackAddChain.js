// 后台添加多条链后，本地存储的账户地址没有同步新添加的链的地址
import {request} from '@/api/https'
import { getAddress as generateAddress } from '@/api/accountUtils';


function isDiffAccount(config, account) {
  const configChains = Object.keys(config);
  const currentChains = Object.keys(account.address);
  if (configChains.length !== currentChains.length) return true;
  return !configChains.every(chain => {
    return currentChains.includes(chain)
  })
  // const addressLength = Object.keys(config).length;
  // const currentAddressLength = Object.keys(account.address).length;
  // return addressLength !== currentAddressLength
}

export async function syncAccount(pubKey) {
  const res = await request({
    url: "/wallet/sync",
    data: { pubKey }
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
          // 使用pub重新生成一遍账户
          account.address = generateAddress(pub, config);
          await syncAccount(account.pub)
        }
      }
      if (flag) {
        console.log(accountList, 363636)
        localStorage.setItem('accountList', JSON.stringify(accountList))
      }
    }
  } catch (e) {
    console.log(e, 666)
    setTimeout(() => {
      hackAddChain(config)
    }, 3000)
  }
}


