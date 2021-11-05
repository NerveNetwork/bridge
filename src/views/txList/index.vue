<template>
  <div class="tx-list second-page">
<!--    <back-bar :backTitle="$t('txList.txList1')"></back-bar>-->
    <div class="content">
      <div class="content-inner">
        <tab-switch v-model="swapType"></tab-switch>
        <div class="tab-wrap" v-show="swapType==='swft'" v-loading="loading1">
          <div class="search">
            <el-select v-model="depositCoinCode" clearable :placeholder="$t('txList.txList7')">
              <el-option
                v-for="item in supportList"
                :key="item.coinId"
                :disabled="item.coinCode === receiveCoinCode"
                :label="item.coinCode"
                :value="item.coinCode">
              </el-option>
            </el-select>
            <el-select v-model="receiveCoinCode" clearable :placeholder="$t('txList.txList8')">
              <el-option
                v-for="item in supportList"
                :key="item.coinId"
                :disabled="item.coinCode === depositCoinCode"
                :label="item.coinCode"
                :value="item.coinCode">
              </el-option>
            </el-select>
            <el-button @click="searchSwftList">{{ $t("public.filter") }}</el-button>
          </div>
          <tx-list :list="swftTxList" @toDetail="toSwftTxDetail" :total="txTotal1" :loading="txLoading1"
                    @loadMoreTx="getSwftTxList" isSwft>
          </tx-list>
        </div>
        <div class="tab-wrap" v-show="swapType==='nerve'" v-loading="loading">
          <div class="search">
            <el-select v-model="fromChain" clearable :placeholder="$t('txList.txList2')">
              <el-option
                v-for="item in chainList"
                :key="item.value"
                :disabled="item.value === toChain"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="toChain" clearable :placeholder="$t('txList.txList3')">
              <el-option
                v-for="item in chainList"
                :key="item.value"
                :disabled="item.value === fromChain"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-button @click="searchList">{{ $t("public.filter") }}</el-button>
          </div>
          <tx-list :list="txList" @toDetail="toTxDetail" :total="txTotal" :loading="txLoading"
                    @loadMoreTx="getTxList">
          </tx-list>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import BackBar from '@/components/BackBar';
import TxList from "@/components/TxList";
import TabSwitch from "@/components/TabSwitch";
import { valideNetwork, networkToChain } from "../home/SwftSwap"
import moment from "moment"
import {getCurrentAccount, superLong, supportChainList} from '@/api/util'

export default {
  data () {
    this.chainList = supportChainList
    return {
      swapType: "nerve",
      loading1: true,
      loading: true,
      depositCoinCode: "", // swft 发起兑换资产
      receiveCoinCode: "", //swft 兑换得到资产
      supportList: [],
      fromChain: "", //发起网络
      toChain: "", //接收网络
      txLoading1: false,
      txLoading: false,
      swftTxList: [],
      txList: [],
      txTotal1: 1,
      txTotal: 1,
      pageNumber1: 1,
      pageNumber: 1,
      pageSize: 10
    }
  },

  components: {
    // BackBar,
    TxList,
    TabSwitch
  },

  watch: {},


  created() {
    const address = this.$route.query.address;
    const network = sessionStorage.getItem("network");
    const accountList = JSON.parse(localStorage.getItem("accountList")) || [];
    this.currentAccount = accountList.filter(item => {
      return item.address[network].toLowerCase() === address.toLowerCase()
    })[0]
    this.getCoins();
    this.getSwftTxList();
    this.getTxList();
  },

  mounted() {},

  methods: {
    superLong(str, len = 5) {
      return superLong(str, len);
    },
    // 获取swft支持的闪兑列表
    async getCoins() {
      const res = await this.$request({
        url: "/coins"
      });
      if (res.msg === "success") {
        const coins = res.data.filter(v => valideNetwork.indexOf(v.mainNetwork) > -1);
        coins.map(v => {
          const chain = networkToChain[v.mainNetwork]
          v.chain = chain.chain
          v.symbol = v.coinCode.split("(")[0]
          /* v.chainId = chain.chainId
          v.assetId = v.contact ? 0 : chain.assetId */
          v.contractAddress = v.contact
        })
        this.supportList = coins;
      }
    },
    async getSwftTxList() {
      this.txLoading1 = true;
      if ((this.pageNumber1 - 1) * this.pageSize > this.txTotal1) {
        this.txLoading1 = false;
        return;
      }
      const res = await this.$request({
        url: "/list",
        data: {
          depositCoinCode: this.depositCoinCode,
          receiveCoinCode: this.receiveCoinCode,
          destinationAddr: this.$route.query.address,
          pageSize: this.pageSize,
          pageNumber: this.pageNumber1
        }
      });
      if (res.msg === "success") {
        res.data.content.map(v=> {
          v.createTime = moment(v.createdDate).format("MM-DD HH:mm:ss")
        })
        this.swftTxList = res.data.content;
        this.txTotal1 = res.data.totalElements;
        this.txLoading1 = false;
      }
      this.loading1 = false;
    },
    async getTxList() {
      this.txLoading = true;
      if ((this.pageNumber - 1) * this.pageSize > this.txTotal) {
        this.txLoading = false;
        return;
      }
      // this.txList = [];
      const addressObj = this.currentAccount.address;
      const data = {
        fromChain: this.fromChain,
        toChain: this.toChain,
        addressList: [addressObj.BSC, addressObj.NERVE, addressObj.NULS],
        pageSize: this.pageSize,
        pageNumber: this.pageNumber++
      }
      const res = await this.$request({
        url: "/tx/bridgeTx/list",
        data
      });
      if (res.code === 1000) {
        res.data.records.map(v=> v.createTime = v.createTime.substring(5))
        this.txList = res.data.records;
        this.txTotal = res.data.total;
        this.txLoading = false;
      }
      this.loading = false;
    },
    searchSwftList() {
      this.pageNumber1 = 1;
      this.txTotal1 = 0;
      this.swftTxList = [];
      this.getSwftTxList();
    },
    searchList() {
      this.pageNumber = 1;
      this.txTotal = 0;
      this.txList = [];
      this.getTxList();
    },
    toSwftTxDetail(txData) {
      console.log(txData, 665544)
      this.$router.push({
        path: "/tx-detail",
        query: {
          orderId: txData.orderId,
          equipmentNo: txData.destinationAddr,
          address: this.$route.query.address
        }
      })
    },
    toTxDetail(txData) {
      this.$router.push({
        path: "/tx-detail",
        query: {
          txHash: txData.txHash,
          address: this.$route.query.address
        }
      })
      // console.log(456)
    },
    loadMoreTx() {
      this.getTxList();
      // console.log(123)
    }
  }
}

</script>
<style lang="less" scoped>
.tx-list {
  .content {
    //height: 390px;
  }
  .content-inner {
    height: calc(100% - 15px);
    .tab-wrap {
      height: calc(100% - 50px);
    }
    .search {
      display: flex;
      align-items: center;
      .el-select {
        width: 120px;
        height: 34px;
        margin-right: 20px;
      }
      /deep/.el-input__inner {
        border-radius: 8px;
        border-color: #EBEEF8;
        padding: 0 10px;
      }
      .el-button {
        width: 80px;
        height: 30px;
        padding: 0;
        border-color: #5BCAF9;
        color: #5BCAF9;
        border-radius: 4px;
      }
      @media screen and (max-width: 1200px) {
        .el-select {
          width: auto;
          margin-right: 10px;
        }
        .el-input__inner {
          font-size: 13px;
        }
      }
    }
  }
}
</style>