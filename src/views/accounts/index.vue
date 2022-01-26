<template>
  <div class="account-list second-page" v-loading="loading">
    <div class="content">
       <h3 class="tc">{{ $t("accounts.accounts2") }}</h3>
       <ul>
         <li v-for="item in accountList" :key="item.chain">
           <div>
             <img 
              :src="getLogoSrc(item.icon)"
              class="coin-img"
            >
            <span>{{ item.chain }}</span>
           </div>
           <div>
            <span >
              <span class="clicks hover-bg" @click="copy(item.address)">{{ superLong(item.address) }}</span>
              <i class="iconfont icon-lianjie clicks" @click="openUrl(item.address, item.chain, item.scan)"></i>
            </span>
            <span>{{item.balance + item.symbol}}</span>
          </div>
         </li>
       </ul>
    </div>
   
  </div>
</template>

<script>
// import BackBar from '@/components/BackBar'
import { superLong, getLogoSrc, copys, getCurrentAccount, getChainConfigs, fixNumber } from '@/api/util';
import { getEVMBalance, getNBalance } from '@/api/api';

let isLoading = false;
export default {
  data () {
    return {
      loading: true,
      accountList: [],
      timer: null
    }
  },

  watch: {
    '$store.state.address': {
      immediate: true,
      handler(val) {
        if (val) {
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null;
          }
          this.address = val
          this.getBalance();
          this.timer = setInterval(() => {
            this.getBalance();
          }, 10000)
        }
      }
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  methods: {
    async getBalance() {
      const currentAccount = getCurrentAccount(this.address)
      if (!currentAccount) {
        this.$router.push("/")
        isLoading = false;
        return;
      }
      if (isLoading) return;
      isLoading = true;
      let list = [];
      if (currentAccount) {
        const configs = getChainConfigs();
        const promiseList = []
        for (let i in configs) {
          const config = configs[i]
          const address = currentAccount.address[config.chain]
          let balance = 0;
          if (Number(config.nativeId) > 0) {
            promiseList.push(getEVMBalance(config.chain, address, ''))
            // balance = await getEVMBalance(config.chain, address, '')
          } else {
            promiseList.push(getNBalance(config.chain, address, config.chainId, 1, '', 8))
            // balance = await getNBalance(config.chain, address, config.chainId, 1, '', 8)
          }
        }
        const res = await Promise.all(promiseList);
        Object.values(configs).map((config, index) => {
          const address = currentAccount.address[config.chain]
          list.push({
            address: address,
            chain: config.chain,
            symbol: config.symbol,
            balance: fixNumber(res[index], 8),
            icon: config.icon,
            scan: config.scan
          })
        })
        this.accountList = list
      }
      // console.log(list, 4564)
      isLoading = false;
      this.loading = false;
    },
    /*async getEVMBalance(address, apiUrl) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(apiUrl);
        const balance = await provider.getBalance(address);
        // return ethers.utils.formatEther(balance)
        return divisionAndFix(balance, 18, 8)
      } catch (e) {
        return 0
      }
    },
    async getNBalance(address, apiUrl, chainId) {
      try {
        const method = 'getAccountBalance';
        const result = await post(apiUrl, method, [chainId, chainId, 1, address])
        if (result.result) {
          return divisionAndFix(result.result.balance, 8)
        } else {
          return 0
        }
      } catch (e) {
        return 0
      }
    },*/
    superLong(str, len = 5) {
      return superLong(str, len)
    },
    getLogoSrc(symbol) {
      return getLogoSrc(symbol)
    },
    copy(str) {
      copys(str)
      this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
    },
    openUrl(address, chain, scanUrl) {
      let url;
      if (chain !== "NERVE" && chain !== "NULS") {
        url = scanUrl + "address/" + address;
      } else {
        url = scanUrl + "address/info?address=" + address
      }
      window.open(url)
    }
  }
}

</script>
<style lang="less" scoped>
.account-list {
  .content {
    padding: 0 15px 20px;
    background-color: #F0F2F7;
    h3 {
      //width: 60%;
      margin: 0 auto;
      //padding: 15px 0;
      font-size: 12px;
      color: #99A3C4;
      padding: 15px 20%;
    }
    ul {
      background-color: #fff;
      border-radius: 10px;
      padding: 5px 20px;
    }
    ul li {
      border-bottom: 1px solid #E9EBF3;
      padding: 10px 0;
      &:last-child {
        border-bottom: none;
      }
      div {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        &:last-child {
          justify-content: space-between;
          font-size: 15px;
        }
        .icon-lianjie {
          margin-left: 12px
        }
      }
      img {
        width: 30px;
        height: 30px;
        margin-right: 5px;
      }
    }
  }
}
</style>