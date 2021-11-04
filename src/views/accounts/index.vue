<template>
  <div class="account-list second-page">
    <div class="content" v-loading="loading">
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
import { superLong, divisionAndFix, getLogoSrc, networkOrigin, copys } from '@/api/util'
export default {
  data () {
    return {
      loading: true,
      accountList: []
    }
  },

  mounted() {
    this.getBalance();
    const timer = setInterval(() => {
      this.getBalance();
    }, 10000)
    this.$once("hook:beforeDestroy", () => {
      clearInterval(timer)
    })
    
  },

  methods: {
    async getBalance() {
      // this.loading = true;
      const address = this.$route.query.address;
      const network = sessionStorage.getItem("network");
      const accountList = JSON.parse(localStorage.getItem("accountList")) || [];
      const currentAccount = accountList.filter(item => {
        return item.address[network] === address
      })
      let list = []
      if (currentAccount[0]) {
        const pubKey = currentAccount[0].pub;
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
          const order = ["Ethereum", "BSC", "Polygon", "Heco", "OKExChain", "Harmony", "KCC", "NERVE", "NULS"]
          list = list.sort((a, b) => {
            return order.indexOf(a.chain) - order.indexOf(b.chain)
          })
        }
      }
      this.loading = false;
      this.accountList = list
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