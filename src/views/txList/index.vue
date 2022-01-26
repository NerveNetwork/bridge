<template>
  <div class="tx-list second-page">
<!--    <back-bar :backTitle="$t('txList.txList1')"></back-bar>-->
    <div class="content">
      <div class="content-inner">
        <div class="tab-wrap" v-loading="loading">
          <div class="search">
            <el-select v-model="fromChain" clearable :placeholder="$t('txList.txList2')">
              <el-option
                v-for="item in chainList"
                :key="item.chain"
                :disabled="item.value === toChain"
                :label="item.chain"
                :value="item.chain">
              </el-option>
            </el-select>
            <el-select v-model="toChain" clearable :placeholder="$t('txList.txList3')">
              <el-option
                v-for="item in chainList"
                :key="item.chain"
                :disabled="item.chain === fromChain"
                :label="item.chain"
                :value="item.chain">
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
// import BackBar from '@/components/BackBar';
import TxList from "@/components/TxList";
// import TabSwitch from "@/components/TabSwitch";
import {getCurrentAccount, superLong, getChainConfigs} from '@/api/util'

export default {
  data () {
    return {
      loading: true,
      fromChain: "", //发起网络
      toChain: "", //接收网络
      txLoading: false,
      txList: [],
      txTotal: 1,
      pageNumber: 1,
      pageSize: 10,
      chainList: []
    }
  },

  components: {
    // BackBar,
    TxList,
    // TabSwitch
  },

  watch: {
    '$store.state.address': {
      immediate: true,
      handler(val) {
        if (val) {
          this.currentAccount = getCurrentAccount(val);
          if (!this.currentAccount) {
            this.$router.push("/")
            return;
          }
          this.address = this.currentAccount.address.BSC
          this.init();
        }
      }
    }
  },

  mounted() {
    const configs = getChainConfigs();
    this.chainList = Object.values(configs);
  },

  methods: {
    init() {
      this.getTxList();
    },
    superLong(str, len = 5) {
      return superLong(str, len);
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
        res.data.records.map(v=> {
          v.createTime = v.createTime.substring(5)
          const { feeTxHash, convertSymbol, status } = v;
          if (status <= 2 && convertSymbol && !feeTxHash) {
            // 未转入手续费
            v.needFee = true;
          }
        })
        this.txList = res.data.records;
        this.txTotal = res.data.total;
        this.txLoading = false;
      }
      this.loading = false;
    },
    searchList() {
      this.pageNumber = 1;
      this.txTotal = 0;
      this.txList = [];
      this.getTxList();
    },
    toTxDetail(txData) {
      this.$router.push({
        path: "/tx-detail",
        query: {
          txHash: txData.txHash
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
        height: 32px;
        margin-right: 20px;
      }
      /deep/.el-input__inner {
        border-radius: 8px;
        border-color: #EBEEF8;
        padding: 0 10px;
        font-size: 12px;
      }
      .el-button {
        width: 60px;
        height: 32px;
        padding: 0;
        border-color: #5BCAF9;
        color: #5BCAF9;
        border-radius: 10px;
        font-size: 12px;
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