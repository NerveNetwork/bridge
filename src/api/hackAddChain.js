// 后台添加多条链后，本地存储的账户地址没有同步新添加的链的地址

function generateAddress(config, account) {
  const newAccount = {}
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

function hackAddChain(config) {
  const accountList = JSON.parse(localStorage.getItem('accountList')) || [];
  if (accountList.length) {
    const addressLength = Object.keys(config).length;
    if (!addressLength) return;
    const hasNewChain = accountList.find(account => {
      const currentAddressLength = Object.keys(account.address).length;
      return addressLength !== currentAddressLength
    })
    // 当前生成的多链地址数量和配置的多链数量不一致
    if (hasNewChain) {
      accountList.map(account => {
        account.address = generateAddress(config, {...account.address});
      })
      console.log(accountList, 54654564)
      localStorage.setItem('accountList', JSON.stringify(accountList))
    }
  }
}

export {
  hackAddChain
}

