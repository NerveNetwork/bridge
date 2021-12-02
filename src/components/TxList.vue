<template>
  <div class="tx-list">
    <ul class="list" v-infinite-scroll="load" infinite-scroll-disabled="disabled">
      <li v-for="(item,index) in oldList" :key="index" @click="handleClick(item)">
        <template v-if="!isSwft">
          <div class="top">
            <div class="chain">
              <span>{{item.fromChain }}</span>
              <i class="iconfont icon-to"></i>
              <span>{{ item.toChain }}</span>
            </div>
            <div class="amount">
              {{ parseFloat(item.amount) }} {{ item.symbol }}
            </div>
          </div>
          <div class="bottom">
            <div class="time">{{ item.createTime }}</div>
            <div class="status">
              <!-- {{ getTxStatus(item.status) }} -->
              <template v-if="item.needFee">
                <span>{{ $t("txList.txList9") }}</span>
                <span class="pay-now click">{{ $t("txList.txList10") }}</span>
              </template>
              <template v-else>
                <img src="../assets/img/tx-pending.svg" alt="" v-if="checkStatus(item.status)">
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="top">
            <div class="chain">
              <span>{{item.depositCoinAmt}} {{item.depositCoinCode }}</span>
              <i class="iconfont icon-to" style="margin: 0 10px"></i>
              <span>{{item.receiveCoinAmt}} {{ item.receiveCoinCode }}</span>
            </div>
          </div>
          <div class="bottom" style="marginTop: 8px">
            <div class="time">{{ item.createTime }}</div>
          </div>
        </template>
        
      </li>
    </ul>
    <p class="load-tip" v-if="loading">{{$t('public.loading')}}</p>
    <p class="load-tip" v-if="oldList.length && noMore">{{$t('public.noMore')}}</p>
  </div>
</template>

<script>
  import {superLong, tofix} from "@/api/util";

  export default {
    props: {
      list: {
        type: Array,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: true
      },
      total: [String, Number],
      isSwft: {
        type: Boolean,
        default: false
      },
      autoScrollLoad: {
        type: Boolean,
        default: true
      }
    },
    data() {
      // this.failStatus = [4, 7, 9]
      return {
        oldList: [],
      }
    },
    computed: {
      noMore() {
        return this.oldList.length >= this.total;
      },
      disabled() {
        return this.loading || this.noMore;
      }
    },
    watch: {
      list: {
        immediate: true,
        handler(val) {
          if (!val) return;
          if (val.length !== 0) {
            for (let item of val) {
              item.amount = tofix(item.amount, 6, 1)
            }
            if (this.oldList.length !== 0 && this.autoScrollLoad) {
              this.oldList = [...this.oldList, ...val];
            } else {
              this.oldList = val;
            }
          }else{
            this.oldList = [];
          }
          // console.log(this.oldList, 66);
        }
      }
    },
    methods: {

      superLong(str, len = 5) {
        return superLong(str, len);
      },

      handleClick(item) {
        this.$emit("toDetail", item);
      },

      load() {
        // console.log(this.oldList, 66)
        this.$emit("loadMoreTx");
      },
      checkStatus(status) {
        const pendingStatus = [0, 1, 2, 3, 5, 6]
        // console.log(status, hideStatus.indexOf(status), 52)
        return pendingStatus.indexOf(status) > -1;
      },
      // getTxStatus(status) {
      //   const failStatus = [4, 7, 9]
      //   if (status === 8) {
      //     return this.$t("txList.txList6")
      //   } else if (failStatus.indexOf(status) > -1) {
      //     return this.$t("txList.txList5")
      //   } else {
      //     return this.$t("txList.txList4")
      //   }
      // }
    }
  }

</script>

<style lang="less" scoped>
  .tx-list {
    //overflow: auto;
    // height: calc(100% - 30px);
    //height: calc(100% - 45px);
    padding-bottom: 20px;
    ul {
      margin-top: 20px;
      //border-top: 1px solid #E9EBF3;
    }
    li {
      // height: 82px;
      padding: 12px 0;
      cursor: pointer;
      border-bottom: 1px solid #E9EBF3;
      &:first-child {
        padding-top: 0;
      }
      &:last-child {
        border-bottom: none;
      }
      .top, .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .top {
        .chain {
          span {
            font-size: 16px;
          }
          i {
            display: inline-block;
            margin: 0 5px;
            font-size: 26px;
            color: #99A3C4;
          }
        }
        .amount {
          font-size: 15px;
        }
      }
      .bottom {
        margin-top: 5px;
        .time {
          font-size: 12px;
          color: #99A3C4
        }
        .status {
          display: flex;
          align-items: center;
          span {
            font-size: 12px;
            margin-left: 5px;
            color: #B8741A;
            &.click {
              color: #608FFF;
            }
          }
        }
        .icon-queren1 {
          font-size: 20px;
          color: #5BC9F8
        }
        .icon-shibai {
          font-size: 20px;
          color: red
        }
      }
    }
    .load-tip {
      color: #53b8a9;
      font-size: 12px;
      text-align: center;
      margin-top: 10px;
    }
  }
</style>
