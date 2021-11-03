// 后台添加多条链后，本地存储的账户地址没有同步新添加的链的地址

import {request} from '@/api/https'

function generateAddress(config, account) {
  const newAccount = {}
  const chainLength = Object.keys(config).length;
  if (!chainLength) return account;
  for(let chain in config) {
    if (!account[chain]) {
      if (chain !== 'TRX') {
        newAccount[chain] = account.Ethereum
      }
    } else {
      newAccount[chain] = account[chain]
    }
  }
  // console.log(account)
  return newAccount;
}

function isDiffAccount(config, account) {
  const addressLength = Object.keys(config).length;
  const currentAddressLength = Object.keys(account.address).length;
  return addressLength !== currentAddressLength
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
      const addressLength = Object.keys(config).length;
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
      }
    }
  } catch (e) {
    setTimeout(() => {
      hackAddChain(config)
    }, 3000)
  }

}


