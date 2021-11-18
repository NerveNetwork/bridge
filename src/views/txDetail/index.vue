<template>
  <div class="tx-detail second-page">
    <div class="content" v-loading="loading">
      <div class="content-inner" v-if="!isSwftDetail">
        <div 
          class="status tc"
          :class="status">
          <div class="status-icon">
            <!-- <i class="iconfont icon-queren"></i> -->
            <img src="../../assets/img/detail-success.svg" alt="" v-if="txInfo.status === 8">
            <img src="../../assets/img/detail-fail.svg" alt="" v-else-if="failStatus.indexOf(txInfo.status) > -1 || failType === 1">
            <img src="../../assets/img/detail-pending.svg" alt="" v-else>
          </div>
          <span>{{ failType === 1 ? $t("crossStatusType.noFee") : $t("crossStatusType." + txInfo.status) }}</span>
          <!-- <p v-if="failStatus.indexOf(txInfo.status) > -1">{{ txInfo.errorMsg }}</p> -->
        </div>
        <div class="amount">
          {{txInfo.amount}} {{txInfo.symbol}}
        </div>
        <div class="other-info">
          <!-- <p class="info-item">
            <span class="left">手续费</span>
            <span class="right">88NVT</span>
          </p> -->
          <p class="info-item">
            <span class="left">{{ $t("public.time") }}</span>
            <span class="right">{{txInfo.createTime}}</span>
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
        <div class="fail-retry" v-if="showRetry">
          <el-button type="primary" @click="retry">{{ $t('txDetail.txDetail4') }}</el-button>
        </div>
      </div>
      <div class="content-inner swft-detail" v-else>
        <div 
          class="status tc"
          :class="status">
          <div class="status-icon">
            <!-- <i class="iconfont icon-queren"></i> -->
            <img src="../../assets/img/detail-success.svg" alt="" v-if="swftSuccessStatus.indexOf(txInfo.detailState) > -1">
            <img src="../../assets/img/detail-fail.svg" alt="" v-else-if="swftFailStatus.indexOf(txInfo.detailState) > -1">
            <img src="../../assets/img/detail-pending.svg" alt="" v-else>
          </div>
          <span>{{ $t("swftStatusType." + txInfo.detailState) }}</span>
        </div>
        <div class="amount">
          <!-- {{txInfo.amount}} {{txInfo.symbol}} -->
          <span>{{ txInfo.depositCoinAmt }} {{ txInfo.depositCoinCode }}</span>
          <i class="iconfont icon-to"></i>
          <span>{{ txInfo.receiveCoinAmt }} {{ txInfo.receiveCoinCode }}</span>
        </div>
        <div class="other-info">
          <!-- <p class="info-item">
            <span class="left">手续费</span>
            <span class="right">88NVT</span>
          </p> -->
          <p class="info-item">
            <span class="left">{{ $t("public.time") }}</span>
            <span class="right">{{txInfo.createTime}}</span>
          </p>
          <p class="info-item">
            <span class="left">{{ $t("public.fee") }}</span>
            <span class="right">
              {{ txInfo.depositCoinFeeAmt }} {{ txInfo.depositCoinCode }} + 
              {{ txInfo.estimatedFee }} {{ txInfo.receiveCoinCode }}
            </span>
          </p>
        </div>
      </div>
    </div>
    <el-dialog
      :title="$t('txDetail.txDetail4')"
      :visible.sync="showRetryDialog"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="86%"
      top="5vh"
      class="retry-dialog"
    >
      <div class="transfer-step" v-loading="retryLoading">
        <div class="sign-tips">{{ $t("transfer.transfer7") }}</div>
        <div class="step-list">
          <div
            class="step"
            :class="{ active: index + 1 <= currentStep && item.done }"
            v-for="(item, index) in stepList"
            :key="index"
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
    </el-dialog>
  </div>
</template>

<script>
/*---------------------bridge跨链交易状态-----------------------*/
/* 跨链交易本链未确认
int BG_CROSS_TX_LOCAL_UNCONFIRM = 0;
//跨链交易本链已确认
int BG_CROSS_TX_LOCAL_CONFIRM = 1;
//等待广播闪对交易
int BG_WAIT_BROAD_CONVERT = 2;
//闪对交易已广播待确认
int BG_CROSS_TX_CONVERT_UNCONFIRM = 3;
//闪对交易广播失败
int BG_CROSS_TX_CONVERT_FAIL = 4;
//等待广播nerve跨链交易
int BG_WAIT_BROAD_NERVE = 5;
//跨链交易NERVE链已广播待确认
int BG_CROSS_TX_NERVE_UNCONFIRM = 6;
//跨链交易NERVE链广播失败
int BG_CROSS_TX_NERVE_FAIL = 7;
//目标链最终确认
int BG_CROSS_TX_TARGET_CONFIRM = 8;
//跨链交易失败
int BG_CROSS_TX_FAIL = 9; */

/*---------------------swft跨链交易状态-----------------------*/
/* 
(1)wait_deposit_send:等待存币发送
(2)timeout:超时；
(3)wait_exchange_push:等待交换信息推送；
(4)wait_exchange_return:等待交换信息返回；
(5.1)wait_receive_send:等待接收币种发送, wait_receive_confirm:等待接收币种确认, receive_complete:接收币种确认完成.
(5.2)wait_refund_send:等待退原币币种发送, wait_refund_confirm:等待退原币币种确认, refund_complete:退原币币种确认完成；
(6)ERROR/error:正在处理的订单 
(7)WAIT_KYC: 等待进行KYC或联系客服提供链接
*/
// import BackBar from '@/components/BackBar';
import {
  superLong,
  divisionAndFix,
  networkOrigin,
  copys,
  timesDecimals,
  divisionDecimals,
  Times,
  getCurrentAccount,
  withdrawalToNulsFee,
  withdrawFeeRate, fixNumber, Division
} from '@/api/util'
import moment from "moment"
import { ETransfer, NTransfer, getSymbolUSD, swapScale, swapSymbolConfig, crossFee, reportError, gasLimitConfig } from "@/api/api";
import { MAIN_INFO, NULS_INFO, ETHNET } from "@/config";
import BufferReader from "nerve-sdk-js/lib/utils/bufferreader";
import txs from "nerve-sdk-js/lib/model/txs";
import { ethers } from 'ethers'


// function getCurrentAccount(address) {
//   const accountList = JSON.parse(localStorage.getItem("accountList")) || [];
//   const currentAccount = accountList.find((item) => {
//     return Object.keys(item.address).find(v => item.address[v] === address)
//   });
//   return currentAccount;
// }

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default {
  data () {
    this.timer = null;
    this.failStatus = [4, 7, 9];
    // this.failType = "" ; // 1、需要闪兑，但是未跨入手续费；2、闪兑失败；3、nerve跨出失败
    this.swftSuccessStatus = ["receive_complete"];
    this.swftFailStatus = ["timeout", "ERROR/error", "wait_refund_send", "wait_refund_confirm", "refund_complete", "WAIT_KYC"];
    this.swftPendingStatus = ["wait_deposit_send", "wait_exchange_push", "wait_exchange_return", "wait_receive_send", "wait_receive_confirm"];
    return {
      loading: true,
      txInfo: {},
      hashList: [],
      isSwftDetail: false,
      showRetry: false,
      showRetryDialog: false,
      retryLoading: true,
      currentStep: 1,
      stepList: [],
      destroyed: false,
      failType: "", // 1、需要闪兑，但是未跨入手续费；2、闪兑失败；3、nerve跨出失败
    }
  },

  components: {},

  watch: {
    showRetryDialog(val) {
      this.currentStep = 1;
      this.stepList = [];
      if (!val) {
        this.setTimer();
      } else {
        this.clearTimer()
      }
    }
  },

  computed: {
    status() {
      const status = this.txInfo.status;
      if (status === 8) {
        return ""
      } else if (this.failStatus.indexOf(status) > -1) {
        return "fail"
      } else {
        return "pending"
      }
    }
  },


  mounted() {
    this.isSwftDetail = false;
    this.setTimer();

    /*const {txHash, orderId} = this.$route.query;
    if (txHash) {
      this.isSwftDetail = false;
      this.setTimer();
    } else if (orderId) {
      this.isSwftDetail = true;
      this.getSwftDetail();
      const timer = setInterval(() => {
        this.getSwftDetail();
      }, 10000)
      this.$once("hook:beforeDestroy", () => {
        clearInterval(timer)
      })
    }*/
  },

  beforeDestroy() {
    this.clearTimer()
  },

  destroyed() {
    this.destroyed = true;
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
    async getSwftDetail() {
      const {equipmentNo, orderId} = this.$route.query
      if (!equipmentNo || !orderId) {
        this.$message({message: "not fount", type: 'warning', duration: 2000});
        this.$router.push('/')
      }
      const res = await this.$request({
        url: "/orderinfo",
        data: {
          sourceType: "H5",
          orderId,
          equipmentNo
        }
      });
      if (res.msg === "success") {
        res.data.createTime = moment(res.data.createTime).format("MM-DD HH:mm:ss")
        this.txInfo = res.data;
      }
      this.loading = false;
    },
    async getDetail() {
      const txHash = this.$route.query.txHash;
      const res = await this.$request({
        url: "/tx/bridge/tx",
        data: { txHash }
      })
      let hashList = [];
      if (res.code === 1000) {
        const data = res.data;
        this.txInfo = data;
        this.checkIsFailed();
        this.handleHash();
        hashList.push({
          chain: data.fromChain,
          label: data.fromChain + this.$t("transfer.transfer2"),
          hash: data.txHash
        })
        if (data.feeTxHash) {
          hashList.push({
            chain: data.fromChain,
            label: data.fromChain + this.$t("transfer.transfer2"),
            hash: data.txHash
          })
        }
      }
      this.loading = false;
    },
    // 检查交易是否失败或者签名流程未完成
    checkIsFailed() {
      // failType 1、需要闪兑，但是未跨入手续费；2、闪兑失败；3、nerve跨出失败
      const { feeTxHash, convertSymbol, status } = this.txInfo;
      if (status <= 2 && convertSymbol && !feeTxHash) {
        // 返回状态为失败
        this.showRetry = true;
        this.failType = 1;
      }/*  else if (status === 4) {
        this.showRetry = true;
        this.failType = 2;
      } else if (status === 7) {
        this.showRetry = true;
        this.failType = 3;
      }  */else {
        this.showRetry = false;
        this.failType = "";
      }
    },
    // 每笔交易hash处理
    handleHash() {
      const { fromChain, toChain, txHash, feeTxHash, convertTxHash, nerveTxHash, crossTxHash } = this.txInfo;
      let hashList = [];
      hashList.push({
        chain: fromChain,
        label: fromChain,
        hash: txHash
      })
      if (feeTxHash) {
        hashList = hashList.concat([
          { chain: fromChain, label: fromChain + this.$t("txDetail.txDetail2"), hash: feeTxHash }, // 转入闪兑手续费
          // { chain: "NERVE", label: "NERVE" + this.$t("txDetail.txDetail3"), hash: convertTxHash } // nerve闪兑
        ])
      }
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
      const baseUrl = networkOrigin[chain];
      let url;
      if (chain !== "NERVE" && chain !== "NULS") {
        url = baseUrl + "/tx/" + hash;
      } else {
        url = baseUrl + "/transaction/info?hash=" + hash
      }
      window.open(url)
    },
    // bridge失败重发
    async retry() {
      this.showRetryDialog = true;
      this.retryLoading = true;
      // nerve作为中转链时,固定的中转nerve地址
      const crossAddressMap = JSON.parse(localStorage.getItem("crossAddressMap"))
      const crossAddress_Nerve = crossAddressMap.crossNerveAddress;
      try {
        const { amount, fromAddress, fromChain } = this.txInfo;
        const currentAccount = getCurrentAccount(fromAddress);
        this.signInfo = {
          pub: currentAccount.pub,
          signAddress: currentAccount.address.Ethereum
        }
        // this.accountInfo = currentAccount;
        // const nerveAddress = currentAccount.address.NERVE;
        // const assetInfo = await this.getAssetInfo();
        // const transferAmount = timesDecimals(amount, assetInfo.decimals);
        this.assetOnNerve = await this.getAssetNerveInfo();
        if (this.failType !== 1) {
          this.$message({ message: "Unkonwn tx type", type: "warning", duration: 2000 });
          this.showRetryDialog = false;
          this.retryLoading = false;
          return;
        }
        if (fromChain !== "NULS") {
          const chain = sessionStorage.getItem("network");
          if (chain !== fromChain) {
            this.$message({ message: this.$t("tips.tips11"), type: "warning", duration: 2000 });
            this.showRetryDialog = false;
            this.retryLoading = false;
            return;
          }
        }
        const fee = await this.getFee();
        await this.constructCrossInTx(crossAddress_Nerve, fee);

        /*const crossoutTransferInfo = await this.getCrossoutTransferInfo(assetInfo, nerveAddress, transferAmount);
        const { transferInfo, type, swapNVT } = crossoutTransferInfo;
        if (this.failType === 3) {
          // nerve跨出失败, 重新发送跨出交易
          await this.constructTx("NERVE", type, transferInfo, transferInfo.txData || {}, this.$t("transfer.transfer5"), false);
        } else {
          const { chainId, assetId } = await this.getAssetNerveInfo(true);
          // 用于闪兑nvt的主资产数量, nvt数量已*2
          let fee = await this.getSwapCost(swapNVT, nerveAddress, chainId, assetId); 
          if (this.failType === 1) {
            // console.log(555)
            if (fromChain !== "NULS") {
              const chain = sessionStorage.getItem("network");
              if (chain !== fromChain) {
                this.$message({ message: this.$t("tips.tips11"), type: "warning", duration: 2000 });
                this.showRetryDialog = false;
                this.retryLoading = false;
                return;
              }
            }
            // 未转入手续费, 转入手续费再闪兑提现
            // const address = fromChain === "NULS" ? nerveAddress :crossAddress_Nerve
            await this.constructCrossInTx(crossAddress_Nerve, fee);
            //  使用中转nerve后，不需要再组装闪兑提现交易
            // await this.constructSwapAndWithdrawalTx(nerveAddress, transferInfo, type, fee, chainId, assetId);
          } else {
            // 已转入手续费，进行闪兑+提现， 闪兑NVT数量*0.8， 避免价格波动引起闪兑时主资产余额不足
            throw "Unknown error" //  使用中转nerve后，不会出现此情况
            // fee = Times(fee, 0.8).toString();
            // await this.constructSwapAndWithdrawalTx(nerveAddress, transferInfo, type, fee, chainId, assetId);
          }
        }*/
        this.runTransfer();
      } catch (e) {
        console.log(e, "eee", e.toString())
        reportError(this.txInfo.txHash, JSON.stringify(e))
        this.$message({ message: this.$t("tips.tips6"), type: "warning", duration: 2000 });
        this.showRetryDialog = false;
      }
      this.retryLoading = false;
    },
    async getFee() {
      const { fromChain, toChain } = this.txInfo;
      const nvtUSD = await getSymbolUSD("NERVE");
      const fromChainMainAssetUSD = await getSymbolUSD(fromChain);
      let nvtAmountForWithdrawal = withdrawalToNulsFee;
      let finalFee = ""
      if (toChain === "NULS") {
        nvtAmountForWithdrawal = withdrawalToNulsFee;
        finalFee = fixNumber(Division(Times(nvtAmountForWithdrawal, nvtUSD), fromChainMainAssetUSD).toFixed(8), 8);
      } else {
        const asset = await this.getAssetInfo();
        const assetHeterogeneousInfo = asset.heterogeneousList.filter(
          (v) => v.chainName === toChain
        )[0];
        const toChainMainAssetUSD = await getSymbolUSD(toChain);
        const isToken = assetHeterogeneousInfo.token;
        const transfer = new ETransfer({chain: toChain});
        const result = await transfer.calWithdrawalNVTFee(
          nvtUSD,
          toChainMainAssetUSD,
          isToken
        );
        const type = "normal" //this.speedUpFee ? "speed" : "normal"
        const scale = withdrawFeeRate[toChain][type];
        nvtAmountForWithdrawal = divisionDecimals(result * scale, 8)
        // console.log(nvtAmountForWithdrawal, 54444444444444)
        finalFee = fixNumber(Division(Times(nvtAmountForWithdrawal, nvtUSD), fromChainMainAssetUSD).toFixed(8), 8);
      }
      return finalFee;
    },
    // 获取跨链资产信息
    async getAssetInfo() {
      const { fromChain, fromAddress, assetId, chainId, contractAddress } = this.txInfo;
      const params = {
        chain: fromChain,
        address: fromAddress,
        chainId,
        assetId,
        contractAddress,
        refresh: true
      };
      const res = await this.$request({
        url: "/wallet/address/asset",
        data: params,
      });
      if (res.code === 1000) {
        return res.data
      } else {
        throw "Get transfer asset info error"
      }
    },

    // 获取资产在nerve链上的信息
    async getAssetNerveInfo(forSwap = false) {
      const { fromChain, assetId, chainId, contractAddress } = this.txInfo;
      let params
      if (forSwap) {
        // 查询主资产在nerve链上的chainId assetId
        const config = JSON.parse(sessionStorage.getItem("config"));
        const fromChainInfo = config[fromChain];
        params = { chainId: fromChainInfo.chainId, assetId: fromChainInfo.assetId }
      } else {
        if (fromChain === "NULS" || fromChain === "NERVE") return { chainId, assetId };
        params = contractAddress ? { chainId, contractAddress } : { chainId, assetId }
      }
      const res = await this.$request({
        url: "/asset/nerve/chain/info",
        data: params,
      });
      if (res.code === 1000) {
        return res.data;
      } else {
        throw "Get nerve info error"
      }
    },

    // 获取nerve转出transferInfo、type、swapNVT(需要闪兑的NVT)
    async getCrossoutTransferInfo(assetInfo, nerveAddress, transferAmount) {
      const { toChain, toAddress } = this.txInfo;
      let transferInfo, type, swapNVT
      const { chainId, assetId } = this.assetOnNerve;
      if (toChain !== "NULS") {
        const withdrawalNVTFee = await this.getCrossOutFee(assetInfo);
        const proposalPrice = timesDecimals(withdrawalNVTFee, MAIN_INFO.decimal);
        const heterogeneousChain_Out = assetInfo.heterogeneousList.filter(
          (v) => v.chainName === toChain
        )[0];
        const txData = {
          heterogeneousAddress: this.accountInfo.address[toChain],
          heterogeneousChainId: heterogeneousChain_Out.heterogeneousChainId,
        };
        transferInfo = {
          from: nerveAddress,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: transferAmount,
          fee: 0,
          proposalPrice,
          txData
        }
        type = 43
        swapNVT = withdrawalNVTFee
      } else {
        const baseCrossFee = timesDecimals(crossFee, MAIN_INFO.decimal);
        transferInfo = {
          from: nerveAddress,
          to: toAddress,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: transferAmount,
          fee: baseCrossFee
        }
        type = 10
        swapNVT = withdrawalToNulsFee
      }
      return {
        transferInfo,
        type,
        swapNVT
      }
    },

    // nerve转出到异构链手续费
    async getCrossOutFee(assetInfo) {
      const assetHeterogeneousInfo = assetInfo.heterogeneousList.filter(
        (v) => v.chainName === this.txInfo.toChain
      )[0];
      const isToken = assetHeterogeneousInfo.token;
      const transfer = new ETransfer({chain: this.txInfo.toChain});
      let nvtUSD = await getSymbolUSD("NERVE");
      nvtUSD = nvtUSD + "";
      let heterogeneousChainUSD = await getSymbolUSD(this.txInfo.toChain);
      heterogeneousChainUSD = heterogeneousChainUSD + "";
      const res = await transfer.calWithdrawalNVTFee(
        nvtUSD,
        heterogeneousChainUSD,
        isToken
      );
      let nvtFee = divisionDecimals(res, 8); // 异构跨链手续费-nvtBalance

      const type = "normal"
      const scale = withdrawFeeRate[this.txInfo.toChain][type];
      return Times(nvtFee, scale).toString()
    },

    // 组装其他链转入主资产到nerve交易
    async constructCrossInTx(nerveAddress, fee) {
      console.log(fee, 44)
      const { fromChain, fromAddress } = this.txInfo;
      const config = JSON.parse(sessionStorage.getItem("config"));
      const fromChainInfo = config[fromChain];

      if (fromChain !== "NULS") {
        const crossInInfo = {
          multySignAddress: fromChainInfo.config.crossAddress,
          nerveAddress: nerveAddress,
          numbers: fee,
          fromAddress,
          decimals: fromChainInfo.decimal,
          gasLimit: ethers.utils.bigNumberify(gasLimitConfig.default).toHexString()//
        }
        const transfer = new ETransfer();
        const fn = async () => await transfer.crossIn(crossInInfo);
        if (this.destroyed || !this.showRetryDialog) return;
        this.stepList.push({
          label: this.$t("transfer.transfer3"),
          done: false,
          fn
        });
      } else {
        const baseCrossFee = timesDecimals(crossFee, MAIN_INFO.decimal);
        const crossInInfo = {
          from: fromAddress,
          to: nerveAddress,
          assetsChainId: NULS_INFO.chainId,
          assetsId: NULS_INFO.assetId,
          amount: timesDecimals(fee, NULS_INFO.decimal),
          fee: baseCrossFee,
          // type: 10
        }
        await this.constructTx(
          fromChain, 10, crossInInfo, {}, this.$t("transfer.transfer3"), true
        )
      }
    },

    /**
     * @desc 组装闪兑&转出交易
     * @param nerveAddress
     * @param transferInfo
     * @param type
     * @param swapAmount
     * @param chainId // 闪兑资产chainId
     * @param assetId // 闪兑资产assetId
     */
    async constructSwapAndWithdrawalTx(nerveAddress, transferInfo, type, swapAmount, chainId, assetId) {
      const { fromChain, symbol } = this.txInfo;

      const config = JSON.parse(sessionStorage.getItem("config"));
      // const fromChainInfo = config[fromChain];
      const { symbol: fromSymbol, decimal } = config[fromChain]
      const isTransferMainAsset = fromSymbol === symbol;
      console.log(isTransferMainAsset, "isTransferMainAsset")
      const swapInfo = {
        fromToken: {
          symbol: swapSymbolConfig[fromSymbol],
          chainId,
          assetId
        },
        toToken: {
          symbol: "NVT",
          chainId: MAIN_INFO.chainId,
          assetId: MAIN_INFO.assetId
        },
        fromAmount: timesDecimals(swapAmount, decimal),
        address: nerveAddress
      }
      
      const txData = transferInfo.txData || {};

      const txHexForSign = await this.getSwapHex(swapInfo);
      await this.constructSwapTx(txHexForSign);
      if (isTransferMainAsset) {
        const bufferReader = new BufferReader(Buffer.from(txHexForSign, "hex"), 0);
        // 反序列回交易对象
        const tAssemble = new txs.Transaction();
        tAssemble.parse(bufferReader);
        const hash = tAssemble.getHash().toString("hex");
        const nonce = hash.slice(-16);
        transferInfo.nonce = nonce
      }
      await this.constructTx(
        "NERVE", type, transferInfo, txData, this.$t("transfer.transfer5"), false
      )
    },

    // 查询兑换一定数量nvt需要花费的异构链主资产数量
    async getSwapCost(amount, nerveAddress, chainId, assetId) {
      const { fromChain } = this.txInfo
      const config = JSON.parse(sessionStorage.getItem("config"));
      const { symbol: fromSymbol } = config[fromChain]
      
      // const swapAmount = timesDecimals(Times(amount, swapScale), 8).split(".")[0];
      const swapAmount = timesDecimals(amount, 8).split(".")[0];
      console.log(amount, swapScale, swapAmount, 789)
      const params = {
        address: nerveAddress,
        toAmount: swapAmount,
        fromToken: {
          symbol: swapSymbolConfig[fromSymbol],
          chainId,
          assetId
        },
        toToken: {
          symbol: "NVT",
          chainId: MAIN_INFO.chainId,
          assetId: MAIN_INFO.assetId
        }
      }
      const res = await this.$request({
        url: "/tx/quantity",
        data: params
      });
      if (res.code === 1000 && res.data.data) {
        return res.data.data.quantityPlain
      } else {
        throw res.data
      }
    },

    // 获取闪兑hex
    async getSwapHex(swapInfo) {
      const res = await this.$request({
        url: "/tx/exchange",
        data: swapInfo
      });
      // console.log(res.code, res.data.data)
      if (res.code === 1000 && res.data.data) {
        return res.data.data
      } else {
        throw this.$t("tips.tips2")
      }
    },

    // 构造nerve闪兑交易
    async constructSwapTx(txHexForSign) {
      const fn = async () => {
        // const txHexForSign = await this.getSwapHex(swapInfo);
        const transfer = new NTransfer({ chain: "NERVE" }); 
        const { pub, signAddress } = this.signInfo;
        return await transfer.appendSignature({
          txHexForSign,
          pub,
          signAddress
        });
      }
      if (this.destroyed || !this.showRetryDialog) return
      this.stepList.push({
        label: this.$t("transfer.transfer4"),
        done: false,
        fn
      });
    },

    /**
     * @desc 组装nerve nuls普通跨链，token跨链交易
     * @param needBroadcast 是否需要自己先广播
     */
    async constructTx(chain, type, transferInfo, txData, label, needBroadcast) {
      const fn = async () => {
        const { pub, signAddress } = this.signInfo;
        const transfer = new NTransfer({ chain, type });
        const inputOutput = await transfer.inputsOrOutputs(transferInfo);
        const data = {
          inputs: inputOutput.inputs,
          outputs: inputOutput.outputs,
          txData,
          pub,
          signAddress,
        };
        return await transfer.getTxHex(data);
      }
      if (this.destroyed || !this.showRetryDialog) return
      this.stepList.push({
        label,
        done: false,
        fn,
        needBroadcast
      });
    },

    async runTransfer() {
      // console.log(this.stepList, 55)
      try {
        let updateTx = {
          txHash: this.txInfo.txHash,
          feeTxHash: "",
          convertTxHex: "",
          crossTxHex: ""
        }
        const len = this.stepList.length
        for (let i = 0; i < len; i++) {
          if (this.destroyed || !this.showRetryDialog) return; // 防止页面返回后继续执行异步循环转账，签名
          const step = this.stepList[i];
          if (!step.done) {
            //  调用metamask转账/签名hash
            let res = await step.fn();
            // 广播nuls转入nerve的交易, 转账交易、转入闪兑手续费交易
            if (step.needBroadcast) {
              res = await this.broadcastHex(res)
            }
            if (res) {
              if (res.hash) {
                // 异构链转入手续费
                updateTx.feeTxHash = res.hash;
                this.updateTx(updateTx, true)
              } else {
                if (len > 1 && !updateTx.convertTxHex) {
                  // 兑换手续费
                  updateTx.convertTxHex = res
                } else {
                  // nerve转出
                  updateTx.crossTxHex = res
                }
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
        console.error("error: " + e);
        reportError(this.txInfo.txHash, JSON.stringify(e))
        if (this.destroyed) return;
        this.$message({ message: this.$t("tips.tips6"), type: "warning", duration: 2000 });
      }
      this.showRetryDialog = false;
    },
    //广播nerve nuls跨链转账交易
    async broadcastHex(txHex) {
      const { fromChain } = this.txInfo; 
      const url = fromChain === "NERVE" ? MAIN_INFO.rpc : NULS_INFO.rpc;
      const chainId = fromChain === "NERVE" ? MAIN_INFO.chainId : NULS_INFO.chainId;
      const res = await this.$post(url, 'broadcastTx', [chainId, txHex]);
      if (this.destroyed) return
      if (res.result && res.result.hash) {
        return { hash: res.result.hash };
      } else {
        throw "Broadcast tx failed"
      }
    },
    /**
     * 重发交易
     */
    async updateTx(data, noMsg = false) {
      const params = {
        bridge: true,
        ...data
      }
      // data = { seed: this.txInfo.seed, ...data }
      const res = await this.$request({
        url: "/tx/retry/cross",
        data: params
      });
      if (this.destroyed || noMsg) return
      if (res.code === 1000) {
        this.$message({ message: this.$t("tips.tips1"), type: "success", duration: 2000 })
        this.showRetry = false;
      } else {
        this.$message({ message: res.msg, type: "warning", duration: 2000 })
      }
    }
  }
}

</script>
<style lang="less" scoped>
.tx-detail {
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