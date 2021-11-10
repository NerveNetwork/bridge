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
              <i class="iconfont icon-lianjie clicks" @click="openUrl(item.address, item.chain)"></i>
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
import { superLong, divisionAndFix, getLogoSrc, networkOrigin, copys, getCurrentAccount } from '@/api/util'
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
        this.$message({
          message: "Unknown error",
          type: "warning",
          duration: 2000
        })
        this.$router.push("/")
        return;
      }
      let list = []
      if (currentAccount) {
        const pubKey = currentAccount.pub;
        const accountInfo = await this.$request({
          url: "/wallet/chain/main",
          data: { pubKey }
        })
        if (accountInfo.code === 1000) {
          accountInfo.data.map(v => {
            list.push({
              address: v.address,
              chain: v.chain,
              symbol: v.symbol,
              balance: divisionAndFix(v.balance, v.decimals, 8),
              icon: v.icon
            })
          })
          const order = ["Ethereum", "BSC", "Polygon", "Heco", "OKExChain", "Harmony", "KCC", "NULS", "NERVE"]
          list = list.sort((a, b) => {
            return order.indexOf(a.chain) - order.indexOf(b.chain)
          })
        }
      }
      console.log(list, 4564)
      this.accountList = list
      this.loading = false;
    },
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
    openUrl(address, chain) {
      const baseUrl = networkOrigin[chain];
      let url;
      if (chain !== "NERVE" && chain !== "NULS") {
        url = baseUrl + "/address/" + address;
      } else {
        url = baseUrl + "/address/info?address=" + address
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
    h3 {
      width: 60%;
      margin: 0 auto;
      padding: 15px 0;
      font-size: 12px;
      color: #99A3C4;
    }
    ul {
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;
    }
    ul li {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
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
          margin-left: 20px
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