<template>
  <div class="tx-detail second-page">
    <div class="content" v-loading="loading">
      <div class="content-inner">
        <div
          class="status tc"
          :class="status">
          <div class="status-icon">
            <!-- <i class="iconfont icon-queren"></i> -->
            <img src="../../assets/img/detail-success.svg" alt="" v-if="txInfo.status === 3">
            <img src="../../assets/img/detail-fail.svg" alt="" v-else-if="txInfo.status > 3">
            <img src="../../assets/img/detail-pending.svg" alt="" v-else>
          </div>
          <span>{{ statusText }}</span>
        </div>
        <div class="amount">
          {{ txInfo.amount | toThousands }} {{ txInfo.symbol }}
        </div>
        <div class="other-info">
          <p class="info-item">
            <span class="left">{{ $t("public.time") }}</span>
            <span class="right">{{txInfo.createTime}}</span>
          </p>
          <p class="info-item" v-if="Number(txInfo.bridgeFee)">
            <span class="left">{{ $t("public.txFee") }}</span>
            <span class="right">{{txInfo.bridgeFee}}{{ txInfo.symbol }}</span>
          </p>
        </div>
        <div class="network-info">
          <p class="info-item" v-for="(item, index) in hashList" :key="index">
            <span class="left">{{ item.label }}</span>
            <span class="right">
              <span class="clicks hover-bg" @click="copy(item.hash)">{{ superLong(item.hash) }}</span>
              <i class="iconfont icon-lianjie clicks" @click="openUrl(item.hash, item.chain)"></i>
            </span>
          </p>
        </div>
        <div class="support-link">
          <a href="https://t.me/NerveNetwork" :target="isMobile && '_self' || '_blank'">{{ $t("txDetail.txDetail8") }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*---------------------bridge跨链交易状态-----------------------*/
/*
* //订单已创建
  int CROSS_TX_STATUS_INIT = 0;
  //用户已发送交易
  int CROSS_TX_STATUS_SEND_TX = 1;
  //跨链处理中
  int CROSS_TX_STATUS_PENDING = 2;
  //跨链成功
  int CROSS_TX_STATUS_SUCCESS = 3;
  //跨链交易失败
  int CROSS_TX_STATUS_FAILED = 4;
  //订单超时
  int CROSS_TX_STATUS_TIMEOUT = 5;
*  */

import { superLong, copys, openScan } from '@/api/util';

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default {
  data () {
    this.timer = null;
    this.isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
    return {
      loading: true,
      txInfo: {},
      hashList: []
    }
  },

  computed: {
    status() {
      const status = this.txInfo.status;
      if (status === 3) {
        return ""
      } else if (status > 3) {
        return "fail"
      } else {
        return "pending"
      }
    },
    statusText() {
      const status = this.txInfo.status;
      return this.$t("crossStatusType." + status)
    }
  },


  mounted() {
    this.setTimer();
  },

  beforeDestroy() {
    this.clearTimer()
  },

  methods: {
    setTimer() {
      this.getDetail();
      clearInterval(this.timer)
      this.timer = setInterval(()=>{
        this.getDetail();
      },10000)
    },
    clearTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },
    superLong(str, len = 5) {
      return superLong(str, len)
    },
    async getDetail() {
      const orderId = this.$route.query.orderId;
      const res = await this.$request({
        url: "/bridge/tx/orderId",
        data: { orderId }
      })
      if (res.code === 1000) {
        this.txInfo = res.data;
        this.handleHash();
        this.loading = false;
      } else {
        // this.$message({message: "Network error", type: "warning"})
      }
    },
    // 每笔交易hash处理
    handleHash() {
      const { fromChain, toChain, nerveTxHash } = this.txInfo;
      let { txHash, crossTxHash } = this.txInfo;
      if (fromChain === 'TRON') {
        txHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
      }
      if (toChain === 'TRON') {
        crossTxHash = crossTxHash.startsWith('0x') ? crossTxHash.slice(2) : crossTxHash;
      }
      let hashList = [];
      hashList.push({
        chain: fromChain,
        label: fromChain,
        hash: txHash
      })
      if (nerveTxHash) {
        hashList.push(
          { chain: "NERVE",label: "NERVE",hash: nerveTxHash }
        )
      }
      hashList.push({
        chain: toChain,
        label: toChain,
        hash: crossTxHash
      })
      this.hashList = hashList;
    },
    copy(str) {
      copys(str)
      this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
    },
    openUrl(hash, chain) {
      openScan(chain, 'hash', hash)
    }
  }
}

</script>
<style lang="less" scoped>
.tx-detail {
  background-color: #F0F2F7;
  padding: 15px 15px 0;
  .content-inner {
    position: relative;
    margin-top: 20px;
    .status span {
      font-size: 14px;
      color: #18CCB1;
      padding: 10px 0;
      display: inline-block;
    }
    .status-icon {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      left: 50%;
      transform: translateX(-50%);
      top: -25px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .amount {
      font-size: 24px;
      text-align: center;
      margin-bottom: 30px;
      word-break: break-all;
    }
    .other-info .info-item {
      margin-bottom: 15px;
    }
    .info-item {
      font-size: 14px;
      display: flex;
      align-content: center;
      justify-content: space-between;
      margin-bottom: 25px;
      .left {
        color: #99A3C4;
        // width: 60px;
      }
      .right {
        text-align: right;
      }
    }
    .network-info {
      padding-top: 25px;
      border-top: 1px solid #CED3E5;
      .right {
        cursor: pointer;
      }
      .iconfont {
        margin-left: 10px;
      }
    }
  }
  .swft-detail {
    .amount {
      font-size: 17px;
      .icon-to {
        margin: 0 10px;
        font-size: 26px;
        color: #99A3C4;
      }
    }
  }
  .fail-retry {
    .el-button {
      width: 100%;
    }
  }
  .support-link {
    text-align: center;
    padding: 30px 0 0;
    margin-bottom: -10px;
    a {
      color: #18CCB1;
      font-size: 14px;
    }
  }
  .retry-dialog {
    .el-dialog {
      min-height: 50vh;
    }
    .sign-tips {
      font-size: 14px;
      padding-bottom: 10px;
      color: #99a3c4;
    }
    .step {
      display: flex;
      height: 80px;
      &.active {
        .left {
          .circle {
            background-color: #d2f3ff;
            .inner {
              background-color: #5bcaf9;
            }
          }
          .line {
            background-color: #5bcaf9;
          }
        }
        .right span {
          // color: #000;
          // font-weight: 600;
          color: #5bcaf9;
        }
      }
      .left {
        margin-right: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        .circle {
          width: 32px;
          height: 32px;
          font-size: 12px;
          border-radius: 50%;
          background-color: #f2f3f6;
          // opacity: 0.45;
          text-align: center;
          position: relative;
          .inner {
            position: absolute;
            width: 26px;
            height: 26px;
            line-height: 26px;
            border-radius: 50%;
            top: 3px;
            left: 3px;
            background-color: #cacdd8;
            color: #fff;
          }
        }
        .line {
          width: 2px;
          margin: 5px 0;
          background-color: #cacdd8;
          flex: 1;
        }

      }
      .right {
        padding-top: 5px;
        span {
          display: inline-block;
          font-size: 14px;
          color: #000;
          font-weight: 600;
        }
        i {
          margin-left: 5px;
          color: #99a3c4;
          font-size: 18px;
        }
      }
    }
  }
}
</style>
