<template>
  <div class="transfer second-page" v-loading="loading">
    <back-bar :backTitle="$t('transfer.transfer1')"></back-bar>
    <div class="content">
      <div class="content-inner">
        <div class="sign-tips">{{ $t("transfer.transfer7") }}</div>
        <div class="step-list">
          <div
            class="step"
            :class="{ active: index + 1 <= currentStep && item.done }"
            v-for="(item, index) in stepList" :key="index"
          >
            <div class="left">
              <div class="circle">
                <div class="inner">{{ index + 1 }}</div>
              </div>
              <div class="line" v-if="index + 1 < stepList.length"></div>
            </div>
            <div class="right">
              <span>{{ item.label }}</span>
              <i
                class="el-icon-loading"
                v-if="index + 1 === currentStep && !item.done"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BackBar from "@/components/BackBar";
import { NTransfer, ETransfer, reportError } from "@/api/api";
import { MAIN_INFO, NULS_INFO } from "@/config"
import BufferReader from "nerve-sdk-js/lib/utils/bufferreader";
import txs from "nerve-sdk-js/lib/model/txs";
import { genID } from "@/api/util"

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default {
  data() {
    return {
      loading: true,
      stepList: [],
      currentStep: 1,
      destroyed: false,
      firstNULSHash: "", // nuls往异构链转账时，如果需要转入手续费，则第二条转入手续交易的nonce由第一条的hash来计算
      countResent: 0, // 调用/tx/cross/bridge/transfer失败次数， 两次内重新发送，超过两次交易失败
    };
  },

  components: {
    BackBar,
  },

  watch: {},

  computed: {},

  created() {},

  mounted() {
    const info = JSON.parse(sessionStorage.getItem("transferInfo"));
    if (!info) {
      this.$message({
        message: this.$t("transfer.transfer6"),
        type: "warning",
      });
      this.$router.replace("/");
      return;
    }
    this.sessionInfo = info;
    this.initTransfer();
  },
  destroyed() {
    sessionStorage.removeItem("transferInfo");
    this.destroyed = true;
  },

  methods: {
    async initTransfer() {
      // nerve作为中转链时,固定的中转nerve地址
      const crossAddressMap = JSON.parse(localStorage.getItem("crossAddressMap"))
      if (!crossAddressMap || !crossAddressMap.crossNerveAddress) {
        this.$message({
          message: 'Get Nerve Address Error',
          type: "warning"
        })
        this.$router.replace("/")
      }
      const crossAddress_Nerve = crossAddressMap.crossNerveAddress;
      try {
        const {
          fromChain,
          toChain,
          crossInfo, //普通nerve nuls跨链信息
          crossOutInfo, // 提现
          crossInInfo, // 异构链转入
          NULSContractInfo, // nuls 合约token跨链
          crossInForSwapInfo, // 闪兑资产
        } = this.sessionInfo;
        let errorMsg = this.$t("tips.tips13")
        if (fromChain === "NERVE") {
          let type, transferInfo, errorMsg;
          if (toChain === "NULS") {
            type = 10;
            transferInfo = crossInfo;
          } else {
            type = 43;
            transferInfo = crossOutInfo;
            errorMsg = this.$t("tips.tips14")
          }
          const txData = transferInfo.txData || {}
          await this.constructTx(
            fromChain, type, transferInfo, txData, this.$t("transfer.transfer5"), errorMsg
          )
        } else if (fromChain === "NULS") {
          let type, transferInfo;
          if (NULSContractInfo) {
            type = 16;
            transferInfo = NULSContractInfo;
          } else {
            type = 10;
            transferInfo = crossInfo;
          }
          const txData = transferInfo.txData || {};
          if (toChain !== "NERVE") {
            if (type === 16) {
              txData.args[0] = [crossAddress_Nerve] // 跨链合约资产时
            } else {
              transferInfo.to = crossAddress_Nerve // 使用中转地址
            }
          }
          // 转入
          await this.constructTx(
            fromChain, type, transferInfo, txData, this.$t("transfer.transfer2"), errorMsg
          )
          if (toChain !== "NERVE") {
            // 转入一笔主资产用于闪兑手续费
            crossInForSwapInfo.to = crossAddress_Nerve // 使用中转地址
            errorMsg = this.$t("tips.tips16")
            await this.constructTx(
              fromChain, 10, crossInForSwapInfo, {}, this.$t("transfer.transfer3"), errorMsg
            )
          }
        } else {
          errorMsg = this.$t("tips.tips15")
          if (toChain !== "NERVE") {
            crossInInfo.nerveAddress = crossAddress_Nerve // 使用中转地址
            await this.constructCrossInTx(crossInInfo, this.$t("transfer.transfer2"), errorMsg);
            // 转入一笔主资产用于闪兑手续费
            crossInForSwapInfo.nerveAddress = crossAddress_Nerve // 使用中转地址
            errorMsg = this.$t("tips.tips16")
            await this.constructCrossInTx(crossInForSwapInfo, this.$t("transfer.transfer3"), errorMsg);
          } else {
            await this.constructCrossInTx(crossInInfo, this.$t("transfer.transfer2"), errorMsg);
          }

        }
        this.runTransfer();
      } catch (e) {
        console.log(e, "===组装交易失败===");
        this.$message({
          message: e,
          type: "warning",
          duration: 2000
        });
        setTimeout(() => {
          this.$router.replace("/")
        }, 2000)
      }
      this.loading = false;
    },

    /**
     * @desc 组装nerve nuls普通跨链，token跨链, nerve提现到L1交易
     */
    async constructTx(chain, type, transferInfo, txData, label, errorMsg) {
      try {
        const fn = async (hash) => {
          const { pub, signAddress } = this.sessionInfo
          const transfer = new NTransfer({ chain, type });
          // nuls往异构链转账时，如果需要转入手续费，则第二条转入手续交易的nonce由第一条的hash来计算
          if (hash) {
            transferInfo.nonce = hash.slice(-16)
          }
          const inputOutput = await transfer.inputsOrOutputs(transferInfo);
          const data = {
            inputs: inputOutput.inputs,
            outputs: inputOutput.outputs,
            txData,
            pub,
            signAddress,
          };
          this.firstNULSHash = "";
          return await transfer.getTxHex(data);
        }
        const step = {
          label,
          done: false,
          fn,
          needBroadcast: true // 需要自己调用rpc广播
        };
        this.stepList.push(step);
      } catch (e) {
        throw errorMsg
      }
    },

    // 组装异构链跨链转入交易
    async constructCrossInTx(crossInInfo, label, errorMsg) {
      try {
        const transfer = new ETransfer();
        const fn = async () => await transfer.crossIn(crossInInfo);
        const step = {
          label,
          done: false,
          fn
        };
        this.stepList.push(step);
      } catch (e) {
        throw errorMsg
      }
    },
    async runTransfer() {
      const { fromChain, toChain, fromAddress, toAddress, transferAsset, amount } = this.sessionInfo;
      const { chainId, assetId, contractAddress, symbol } = transferAsset
      const broadcastData = {
        fromChain,
        toChain,
        fromAddress,
        toAddress,
        chainId,
        assetId,
        contractAddress,
        symbol,
        amount,
        txHash: "", // 第一条交易hash
        feeTxHash: "", // 转入的手续费hash
        convertTxHex: "", // 闪兑hex
        crossTxHex: "", // nerve转出到其他网络hex
        convertSymbol: this.stepList.length > 1 //使用中转地址，交易超过一次则需要闪兑
      }
      let updateTx = {
        txHash: "",
        feeTxHash: "",
        convertTxHex: "",
        crossTxHex: ""
      }
      try {
        for (let i = 0; i < this.stepList.length; i++) {
          if (this.destroyed) break; // 防止页面返回后继续执行异步循环转账，签名
          const step = this.stepList[i];
          if (!step.done) {
            //  调用metamask转账/签名hash
            let res = await step.fn(this.firstNULSHash);
            // 广播nuls、nerve的跨链, nerve提现交易
            if (step.needBroadcast) {
              res = await this.broadcastHex(res)
            }
            if (res) {
              if (res.hash) {
                if (i === 0) {
                  //异构链转入
                  broadcastData.txHash = res.hash;
                  updateTx.txHash = res.hash;
                  // nuls往异构链转账时，如果需要转入手续费，则第二条转入手续交易的nonce由第一条的hash来计算
                  this.firstNULSHash = fromChain === "NULS" ? res.hash : "";
                  // 将交易txHash及其他基本信息发给后台已记录该交易
                  await this.broadcast(broadcastData)
                } else {
                  // 异构链转入手续费
                  updateTx.feeTxHash = res.hash;
                  await this.updateTx(updateTx, true)
                }
              } else {
                /*if (updateTx.feeTxHash && !updateTx.convertTxHex) {
                  // 兑换手续费
                  updateTx.convertTxHex = res
                } else {
                  // nerve转出
                  updateTx.crossTxHex = res
                }*/
              }
              await sleep(500);
              this.stepList[i].done = true;
              this.currentStep++;
            } else {
              break;
            }
          }
        }
        // 最终更新广播交易
        await this.updateTx(updateTx)
      } catch (e) {
        if (updateTx.txHash) {
          reportError(updateTx.txHash, e.toString() + JSON.stringify(e))
        }
        if (this.destroyed) return;
        this.$message({ message: this.$t("tips.tips6"), type: "warning", duration: 2000 });
        setTimeout(() => {
          this.$router.replace("/")
        }, 2000)
      }
    },
    //广播nerve nuls跨链转账交易
    async broadcastHex(txHex) {
      const url = this.sessionInfo.fromChain === "NERVE" ? MAIN_INFO.rpc : NULS_INFO.rpc;
      const chainId = this.sessionInfo.fromChain === "NERVE" ? MAIN_INFO.chainId : NULS_INFO.chainId;
      const res = await this.$post(url, 'broadcastTx', [chainId, txHex]);
      if (this.destroyed) return
      if (res.result && res.result.hash) {
        return { hash: res.result.hash };
      } else {
        throw this.$t("tips.tips17")
      }
    },
    // 将交易txHash及其他基本信息发给后台已记录该交易
    async broadcast(data) {
      try {
        this.transferID = genID()
        data = { seed: this.transferID, ...data }
        const res = await this.$request({
          url: "/tx/cross/bridge/transfer",
          data: data
        });
        if (this.destroyed) return
        if (res.code !== 1000) {
          throw res.msg
        }
      } catch(e) {
        console.log(e, this.countResent);
        if (this.countResent === 3) {
          this.countResent = 0;
          throw e;
        } else {
          this.countResent++;
          await sleep(500);
          await this.broadcast(data);
        }
      }
    },
    /**
     * 更新广播交易
     */
    async updateTx(data, noMsg = false) {
      data = { seed: this.transferID, ...data }
      const res = await this.$request({
        url: "/tx/bridge/update/tx",
        data: data
      });
      if (this.destroyed || noMsg) return
      if (res.code === 1000) {
        this.$message({
          message: this.$t("tips.tips1"),
          type: "success",
          duration: 2000
        })
        setTimeout(() => {
          this.$router.replace("/tx-detail?txHash=" + data.txHash)
        }, 2000)
      } else {
        this.$message({
          message: res.msg,
          type: "warning",
          duration: 2000
        })
        setTimeout(() => {
          this.$router.replace("/")
        }, 2000)
      }
    }
  },
};
</script>
<style lang="less">
.transfer {
  height: 100%;
  .content {
    height: calc(~'100% - 40px');
    background-color: #f0f2f7;
    padding: 15px 15px 0;
  }
  .sign-tips {
    font-size: 14px;
    padding: 20px 0;
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
</style>
