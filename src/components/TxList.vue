<template>
  <div class="tx-list">
    <ul class="list" v-infinite-scroll="load" infinite-scroll-disabled="disabled">
      <li v-for="(item,index) in oldList" :key="index" @click="handleClick(item)">
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
            <div class="text-error" v-if="item.status === 0">{{ $t("home.home36") }}</div>
            <template v-else-if="item.status < 3">
              <img src="../assets/img/tx-pending.svg" alt="" >
            </template>
          </div>
        </div>
      </li>
    </ul>
    <p class="load-tip">
      <template v-if="loading">{{$t('public.loading')}}</template>
      <template v-else-if="!oldList.length">{{$t('public.noData')}}</template>
      <template v-else>{{$t('public.noMore')}}</template>
    </p>
<!--    <p class="load-tip" v-if="loading"></p>
    <p class="load-tip" v-if="!oldList.length">{{ $t('public.noData') }}</p>
    <p class="load-tip" v-if="oldList.length && noMore">{{$t('public.noMore')}}</p>-->
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
      autoScrollLoad: {
        type: Boolean,
        default: true
      }
    },
    data() {
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
            /*if (this.oldList.length !== 0 && this.autoScrollLoad) {
              this.oldList = [...this.oldList, ...val];
            } else {
              this.oldList = val;
            }*/
            this.oldList = val
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
        this.$emit("toDetail", item.orderId);
      },

      load() {
        // console.log(this.oldList, 66)
        this.$emit("loadMoreTx");
      },
      checkStatus(status) {
        const pendingStatus = [0, 1, 2, 3, 5, 6]
        // console.log(status, hideStatus.indexOf(status), 52)
        return pendingStatus.indexOf(status) > -1;
      }
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
          padding-top: 5px;
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
          .text-error {
            color: #ef8b75;
            font-size: 12px;
          }
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
