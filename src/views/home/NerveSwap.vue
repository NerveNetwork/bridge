<template>
  <div class="nerve-swap">
    <div class="pending-tx" v-if="pendingTxList.length">
      <span @click="pendingTxDialog=true">{{ $t("home.home27") + "(" + pendingTxList.length + ")" }}</span>
    </div>
    <div class="address-info border-wrap">
      <div class="left">
        <span class="text-label" style="margin-bottom: -2px;">{{ $t("home.home4") }}</span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="text-label">{{ $t("home.home5") }}</span>
      </div>
      <div class="right">
        <div class="from">
          <img class="chain-logo" :src="getChainLogo(fromNetwork)" alt="">
          <span class="chain-name">{{ fromNetwork }}</span>
          <span class="address">{{ superLong(fromAddress) }}</span>
        </div>
        <div class="to clicks" @click="showNetworkList=!showNetworkList">
          <img class="chain-logo" :src="getChainLogo(toNetwork)" alt="">
          <span class="chain-name">{{ toNetwork }}</span>
          <span class="address">{{ superLong(toAddress) }}</span>
          <i class="el-icon-caret-bottom"></i>
          <ChainList v-model="showNetworkList" :currentChain="toNetwork" @change="changeToChain" :disabledChain="fromNetwork"></ChainList>
        </div>
      </div>
    </div>
    <div class="asset-info">
      <div class="label-wrap mb_5">
        <span class="text-label">{{ $t("home.home6") }}</span>
      </div>
      <div class="border-wrap clicks" @click="assetListModal = true">
        <div class="left">
          <template v-if="!chooseAsset">
            <div class="asset-placeholder">
              {{ $t("home.home26") }}
            </div>
          </template>
          <template v-else>
            <img
              class="logo-img"
              :src="getLogoSrc(chooseAsset.icon)"
              @error="replaceImg"
              alt=""
            />
            <div class="asset-info-wrap">
              <span class="symbol">{{ overflowToken(chooseAsset.symbol) }}</span>
              <span class="origin-chain">{{ chooseAsset.registerChain }}</span>
            </div>
          </template>
        </div>
        <div class="right">
          <i class="el-icon-caret-bottom"></i>
        </div>
      </div>
    </div>
    <div class="amount-info">
      <div class="label-wrap mb_5">
        <span class="text-label">{{ $t("public.amount") }}</span>
        <span class="text-label">{{ $t("home.home3") }} {{ fixedAvaliable }}</span>
      </div>
      <div class="border-wrap">
        <el-input
          class="amount-inner"
          placeholder="0"
          :value="amount"
          @input="validateAmount"
        >
          <el-button slot="append" @click="maxAmount">MAX</el-button>
        </el-input>
      </div>
    </div>
    <div class="msg-wrap" v-if="amountMsg">
      <span class="amount-validate-msg">{{
        amountMsg
      }}</span>
    </div>
    <fee-wrap>
      <div class="fee-inner">
        <template v-if="!fee">
          <span v-if="feeLoading" class="el-icon-loading"></span>
        </template>
        <span v-else>
          {{ fee }}
        </span>
      </div>
    </fee-wrap>
    <div class="btn-wrap tc">
      <el-button type="primary" v-if="crossInAuth" :disabled="!!fromChainError" @click="approveERC20">{{
        $t("home.home10")
      }}</el-button>
      <el-button type="primary" v-else :disabled="!canNext" @click="next">{{
        $t("public.next")
      }}</el-button>
    </div>
    <assets-dialog v-model="assetListModal" :list="assetsList" @selectAsset="selectAsset"></assets-dialog>
    <el-dialog
      :title="$t('home.home27')"
      :visible.sync="pendingTxDialog"
      :modal-append-to-body="false"
      width="90%"
      top="5vh"
      class="pending-tx-dialog"
      destroy-on-close
    >
      <tx-list
        :list="pendingTxList"
        @toDetail="toTxDetail"
        :total="pendingTxList.length"
        :autoScrollLoad="false"
        :loading="false"
      >
      </tx-list>
    </el-dialog>
  </div>
</template>

<script>
import FeeWrap from "@/components/FeeWrap";
import AssetsDialog from "./AssetsDialog";
import ChainList from '@/components/ChainList';
import TxList from '@/components/TxList'
import {MAIN_INFO, NULS_INFO, ETHNET, BRIDGE_API_URL} from '@/config'
import {
  superLong,
  divisionDecimals,
  Minus,
  Plus,
  timesDecimals,
  getLogoSrc,
  Times,
  supportChainList,
  debounce,
  getCurrentAccount,
  withdrawFeeRate,
  withdrawalToNulsFee,
  Division,
  fixNumber
} from "@/api/util";
import { ETransfer, getSymbolUSD, swapScale, swapSymbolConfig, crossFee, gasLimitConfig } from "@/api/api";
import { getContractCallData } from "@/api/nulsContractValidate";
import defaultIcon from "@/assets/img/commonIcon.png";
import { ethers } from 'ethers'
import { getERC20AssetsBalance, getNAssetsBalance } from '@/api/getBalanceInBatch'

let chainToSymbol = {}
supportChainList.map(v => {
   chainToSymbol[v.value] = v.symbol
});


export default {
  data () {
    this.networkList = supportChainList;
    this.withdrawalNVTFee = ""; // 提现nvt手续费
    this.extraFee = ""; //用于闪兑nvt的异构链主资产数量
    this.getFeeDebounce = debounce(this.getTransferFee, 1000)
    this.getAllowanceTimer = null; // 查询授权额度定时器
    this.currentAccount = null; // 当前连接的多链账户信息
    this.config = JSON.parse(sessionStorage.getItem("config"))
    this.pendingTxTimer = null;
    return {
      toNetwork: "",
      assetListModal: false,
      assetsList: [], //可跨链资产
      chooseAsset: null, // 选择的跨链资产
      amount: "", //跨链数量
      available: 0,
      fee: "",
      feeLoading: false,
      amountMsg: "", //转账数量验证失败信息
      crossInAuth: false, //异构链转入nerve是否需要授权
      isMainAsset: false, // 是否为主资产
      maxClick: false, // 点击最大
      showNetworkList: false,
      pendingTxList: [], //未转入手续费待处理交易
      pendingTxDialog: false
    }
  },

  props: {
    address: String,
    fromNetwork: String,
    fromChainId: String,
    fromAddress: String,
    fromChainError: Boolean
  },
  components: {
    FeeWrap,
    AssetsDialog,
    ChainList,
    TxList
  },
  watch: {
    address: {
      immediate: true,
      handler(val) {
        if (!val) return;
        this.reset();
        this.toNetwork = "";
        this.currentAccount = getCurrentAccount(val);
      },
    },
    fromNetwork: {
      immediate: true,
      handler(val) {
        if (!val) return;
        // console.log(val, 111)
        this.amountMsg = false;
        this.fee = '';
        if (val === this.toNetwork) {
          this.toNetwork = "";
          this.isMainAsset = false;
        }
      },
    },
    networkPair(val) {
      this.reset();
      if (val[0] && val[1]) {
        this.getCanCrossAssets();
      }
    }
  },

  computed: {
    toAddress() {
      return this.currentAccount ? this.currentAccount.address[this.toNetwork] : "";
    },
    canNext() {
      if (
        !this.toNetwork ||
        !this.chooseAsset ||
        !Number(this.amount) ||
        !this.fee ||
        this.amountMsg ||
        this.fromChainError
      )
        return false;
      return true;
    },
    networkPair() {
      return [this.fromNetwork, this.toNetwork];
    },
    showSpeedUp() {
      const parallelChain = ["NERVE", "NULS"]
      return !(parallelChain.indexOf(this.fromNetwork) > -1 && parallelChain.indexOf(this.toNetwork) > -1);
    },
    fixedAvaliable() {
      if (!this.available) return 0;
      return fixNumber(this.available, 6)
    }
  },

  mounted() {
    this.getPendingTxList();
    const timer = setInterval(() =>{
      this.getPendingTxList();
    }, 5000);
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer);
    })
  },

  methods: {
    async getPendingTxList() {
      const currentAccount = getCurrentAccount(this.address);
      const addressObj = currentAccount.address;
      const data = {
        fromChain: "",
        toChain: "",
        addressList: [addressObj.BSC, addressObj.NERVE, addressObj.NULS],
        pageSize: 20,
        pageNumber: 1
      }
      const res = await this.$request({
        url: "/tx/bridgeTx/list",
        data
      });
      if (res.code === 1000) {
        const list = []
        const pendingStatus = [0, 1, 2, 3, 5, 6]
        res.data.records.map(v=> {
          v.createTime = v.createTime.substring(5)
          const { feeTxHash, convertSymbol, status } = v;
          if (pendingStatus.indexOf(status) > -1) {
            if (status <= 2 && convertSymbol && !feeTxHash) {
              // 未转入手续费
              v.needFee = true;
            }
            list.push(v)
          }
        })
        this.pendingTxList = list;
      }
    },
    reset() {
      this.available = 0;
      this.amount = "";
      this.chooseAsset = null;
      this.assetsList = [];
      this.crossInAuth = false;
      this.withdrawalNVTFee = "";
      this.extraFee = "";
      this.isMainAsset = false;
      this.fee = "";
      this.feeLoading = false;
      this.clearGetAllowanceTimer();
    },
    changeToChain(item) {
      this.toNetwork = item.value;
    },
    getChainLogo(chain) {
      if (!chain) return null;
      const chainInfo = supportChainList.find(item => item.value===chain)
      return chainInfo.logoActive || null;
    },
    // 查询可跨链资产
    async getCanCrossAssets() {
      const res = await this.$request({
        url: "/asset/chain/cross",
        data: {
          fromChain: this.fromNetwork,
          toChain: this.toNetwork,
        },
      });
      if (res.code === 1000) {
        const data = res.data;
        this.assetsList = data.sort((a, b) => {
          return a.symbol.toLowerCase() > b.symbol.toLowerCase() ? 1 : -1
        });
        const config = JSON.parse(sessionStorage.getItem("config"));
        const psUrl = config[this.fromNetwork].apiUrl;
        data.map(v => {
          // 去除ETH资产contractAddress为ETH
          v.contractAddress = v.contractAddress && v.assetId !== 1 ? v.contractAddress : "";
        })
        if (this.fromNetwork === "NERVE" || this.fromNetwork === "NULS") {
          let assetsInfo
          if (this.fromNetwork === "NERVE") {
            assetsInfo = data.map(v => {
              return {
                chainId: v.chainId,
                assetId: v.assetId
              }
            })
          } else {
            assetsInfo = data.map(v => {
              return {
                chainId: v.chainId,
                assetId: v.assetId,
                contractAddress: v.contractAddress || ""
              }
            })
          }
          const chainId = config[this.fromNetwork].chainId;
          const tokenInfo = await getNAssetsBalance(psUrl, chainId, this.fromAddress, assetsInfo)
          data.map(v => {
            tokenInfo.map(token => {
              if (v.chainId === token.assetChainId && v.assetId === token.assetId) {
                v.balance = divisionDecimals(token.balance, v.decimals)
                v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
              }
            })
          })
          console.log(tokenInfo, "tokenInfo-nerve")
        } else {
          const multiCallAddress = config[this.fromNetwork].config.multiCallAddress
          const contractList = data.map(v => {
            return v.contractAddress || multiCallAddress
          })
          const tokenInfo = await getERC20AssetsBalance(contractList, this.fromAddress, multiCallAddress, psUrl)
          // console.log(tokenInfo, "tokenInfo-erc")
          data.map(v => {
            tokenInfo.map(token => {
              if (v.contractAddress) {
                if (v.contractAddress === token.contractAddress) {
                  v.balance = divisionDecimals(token.balance, token.decimals)
                  v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
                }
              } else {
                if (!token.contractAddress) {
                  v.balance = divisionDecimals(token.balance, 18)
                  v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
                }
              }
            })
          })
        }
        this.assetsList = data.sort((a, b) => {
          if (a.balance > 0 || b.balance > 0) {
            return b.balance - a.balance > 0 ? 1 : -1;
          } else {
            return a.symbol.toLowerCase() > b.symbol.toLowerCase() ? 1 : -1
          }
        });
      }
    },
    // 下拉选择资产
    async selectAsset(asset) {
      this.isMainAsset = false;
      this.maxClick = false;
      this.crossInAuth = false;
      this.amountMsg = "";
      this.amount = "";
      this.available = 0;
      this.chooseAsset = asset;
      this.assetListModal = false;
      this.fee = "";
      this.clearGetAllowanceTimer();
      //assset.assetId为0 则为异构链上token资产
      if (asset.assetId === 0 && this.fromNetwork !== "NULS") {
        this.checkCrossInAuthStatus();
      }
      const params = {
        chain: this.fromNetwork,
        address: this.fromAddress,
        chainId: asset.chainId,
        assetId: asset.assetId,
        contractAddress: asset.contractAddress
      };
      //关注资产
      await this.$request({
        url: "/wallet/address/asset/focus",
        data: {
          focus: true,
          ...params,
        },
      });
      if (asset.balance) {
        this.isMainAsset = this.config[this.fromNetwork].assetId === asset.assetId && this.config[this.fromNetwork].chainId === asset.chainId;
        this.available = asset.balance;
      } else {
        const assetInfo = await this.getAssetInfo(params);
        if (assetInfo) {
          this.isMainAsset = this.config[this.fromNetwork].assetId === assetInfo.assetId && this.config[this.fromNetwork].chainId === assetInfo.chainId;
          this.available = divisionDecimals(assetInfo.balance, assetInfo.decimals);
        }
      }
    },
    replaceImg(e) {
      e.target.src = defaultIcon;
    },
    maxAmount() {
      // TODO 主资产时先计算手续费，扣除手续费后再max
      this.maxClick = true;
      if (this.amount === this.available) return;
      this.amount = this.available;
      this.getFeeDebounce();
      // this.validateAmount(this.available, true);
    },
    // 查询异构链token资产授权情况
    async checkCrossInAuthStatus() {
      const transfer = new ETransfer();
      const heterogeneousInfo = this.chooseAsset.heterogeneousList.filter(
        (v) => v.chainName === this.fromNetwork
      )[0];
      const contractAddress = this.chooseAsset.contractAddress;
      const needAuth = await transfer.getERC20Allowance(
        contractAddress,
        heterogeneousInfo.heterogeneousChainMultySignAddress,
        this.fromAddress
      );
      this.crossInAuth = needAuth;
      if (!needAuth && this.getAllowanceTimer) {
        this.clearGetAllowanceTimer();
      }
    },
    async getAssetInfo(params) {
      const res = await this.$request({
        url: "/wallet/address/asset",
        data: {
          refresh: true,
          ...params,
        },
      });
      if (res.code === 1000) {
        return res.data;
      }
      return null
    },
    validateAmount(val, flag=false) {
      if (!flag) {
        this.maxClick = false;
      }
      const decimals = this.chooseAsset && this.chooseAsset.decimals || 8;
      const patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$");
      if (patrn.exec(val)|| val==="") {
        this.amount = val
        this.getFeeDebounce();
      }
    },
    // 计算交易手续费
    async getTransferFee() {
      try {
        if (!this.isMainAsset && (!this.chooseAsset || !Number(this.amount))) {
          this.fee = "";
          this.feeLoading = false;
          return;
        }
        this.fee = "";
        this.feeLoading = true;
        const nerveToNulsFee = crossFee + "NVT" + "+" + crossFee + "NULS";
        const nulsToNerveFee = crossFee + "NULS";

        if (this.fromNetwork === "NERVE") {
          if (this.toNetwork === "NULS") {
            this.fee =  nerveToNulsFee;
          } else {
            const crossOutFee = await this.getCrossOutFee();
            this.fee = crossOutFee;
          }
        } else if (this.fromNetwork === "NULS") {
          let crossInFee = nulsToNerveFee;
          if (this.chooseAsset.contractAddress) {
            crossInFee = await this.getContractCallData();
            if (crossInFee) {
              crossInFee = crossInFee + "NULS";
            } else {
              return null;
            }
          }
          if (this.toNetwork === "NERVE") {
            this.fee = crossInFee;
          } else {
            const crossOutFee = await this.getCrossOutFee();

            // 统一收一笔主资产用作提现手续费
            const symbol = chainToSymbol[this.fromNetwork];
            const extraFee = this.splitFeeSymbol(crossOutFee).value;
            this.extraFee = extraFee;
            const oldCrossInFee = this.splitFeeSymbol(crossInFee).value;
            const asset = this.chooseAsset
            if (asset.contractAddress) {
              // 转入资产为nuls链token资产
              this.fee = Plus(oldCrossInFee, Plus(crossFee, extraFee)) + symbol
            } else if (asset.chainId === NULS_INFO.chainId && asset.assetId === NULS_INFO.assetId) {
              // 转入资产为NULS
              this.fee = Plus(oldCrossInFee, extraFee) + symbol
            } else {
              this.fee = Plus(Times(oldCrossInFee, 2), extraFee) + symbol
            }
          }
        } else {
          const crossInFee = await this.getCrossInFee();
          if (this.toNetwork === "NERVE") {
            this.fee = crossInFee;
          } else {
            const crossOutFee = await this.getCrossOutFee();
            const symbol = chainToSymbol[this.fromNetwork];
            const extraFee = this.splitFeeSymbol(crossOutFee).value;
            this.extraFee = extraFee;
            const oldCrossInFee = this.splitFeeSymbol(crossInFee).value;

            this.fee = Plus(Times(oldCrossInFee, 2), extraFee) + symbol;
          }
        }
        await this.checkAmountFee();
      } catch (e) {
        console.error(e, "计算手续费失败")
      }
      this.feeLoading = false;
    },
    //nuls合约资产跨链 计算手续费&其他信息
    async getContractCallData() {
      // const currentAccount = getCurrentAccount(this.address);
      const NERVEAddress = this.currentAccount.address.NERVE;
      const price = 25;
      const res = await getContractCallData(
        this.fromAddress,
        NERVEAddress,
        price,
        this.chooseAsset.contractAddress,
        "transferCrossChain",
        this.amount,
        this.chooseAsset.decimals
      );
      if (res.success) {
        // console.log(res, 55);
        // this.fee = res.data.fee;
        this.NULSContractGas = res.data.gas;
        this.NULSContractTxData = res.data.contractCallData;
        return res.data.fee;
      } else {
        this.$message({ message: res.msg, type: "warning", duration: 2000 });
        return null;
      }
    },
    // 异构链转入nerve手续费
    async getCrossInFee() {
      const assetHeterogeneousInfo = this.chooseAsset.heterogeneousList.filter(
        (v) => v.chainName === this.fromNetwork
      )[0];
      const isToken = assetHeterogeneousInfo.token;
      const gasLimit = isToken ? gasLimitConfig.token : gasLimitConfig.default;
      this.gasLimit = ethers.utils.bigNumberify(gasLimit).toHexString()
      const transfer = new ETransfer();
      const fee = await transfer.getGasPrice(gasLimit);
      // this.gasPrice = ethers.utils.bigNumberify(fee).div(gasLimit)
      this.gasPrice = ethers.utils.parseUnits(Division(fee, gasLimit).toFixed(), '18').toHexString()
      return fee + chainToSymbol[this.fromNetwork];
    },
    // nerve转出到异构链/NULS手续费
    async getCrossOutFee() {
      const nvtUSD = await getSymbolUSD("NERVE");
      const fromChainMainAssetUSD = await getSymbolUSD(this.fromNetwork);
      let nvtAmountForWithdrawal = withdrawalToNulsFee;
      let finalFee = ""
      if (this.toNetwork === "NULS") {
        nvtAmountForWithdrawal = withdrawalToNulsFee;
        finalFee = fixNumber(Division(Times(nvtAmountForWithdrawal, nvtUSD), fromChainMainAssetUSD).toFixed(8), 8);
      } else {
        const asset = this.chooseAsset;
        const assetHeterogeneousInfo = asset.heterogeneousList.filter(
          (v) => v.chainName === this.toNetwork
        )[0];
        const toChainMainAssetUSD = await getSymbolUSD(this.toNetwork);
        const isToken = assetHeterogeneousInfo.token;
        const transfer = new ETransfer({chain: this.toNetwork});
        const result = await transfer.calWithdrawalNVTFee(
          nvtUSD,
          toChainMainAssetUSD,
          isToken
        );
        const type = "normal";
        const scale = withdrawFeeRate[this.toNetwork][type];
        nvtAmountForWithdrawal = divisionDecimals(result * scale, 8)
        // console.log(nvtAmountForWithdrawal, 54444444444444)
        finalFee = fixNumber(Division(Times(nvtAmountForWithdrawal, nvtUSD), fromChainMainAssetUSD).toFixed(8), 8);
        this.withdrawalNVTFee = finalFee;
      }
      return finalFee + chainToSymbol[this.fromNetwork];
    },

    // 异构链token资产转入nerve授权
    async approveERC20() {
      const transfer = new ETransfer();
      const heterogeneousInfo = this.chooseAsset.heterogeneousList.filter(
        (v) => v.chainName === this.fromNetwork
      )[0];
      const contractAddress = this.chooseAsset.contractAddress;
      const res = await transfer.approveERC20(
        contractAddress,
        heterogeneousInfo.heterogeneousChainMultySignAddress,
        this.fromAddress
      );
      if (res.hash) {
        this.$message({
          message: this.$t("tips.tips1"),
          type: "success",
          duration: 2000,
        });
        this.setGetAllowanceTimer();
      } else {
        this.$message({ message: JSON.stringify(res), type: "warning", duration: 2000 });
      }
    },
    setGetAllowanceTimer() {
      this.getAllowanceTimer = setInterval(() => {
        this.checkCrossInAuthStatus();
      }, 3000)
    },
    clearGetAllowanceTimer() {
      if (!this.getAllowanceTimer) return;
      clearInterval(this.getAllowanceTimer);
      this.getAllowanceTimer = null;
    },

    splitFeeSymbol(str) {
      return {
        symbol: str.match(/[a-z|A-Z]+/gi)[0],
        value: str.match(/[\d|.]+/gi)[0],
      };
    },
    async next() {
      const transferAsset = this.chooseAsset;
      const mainAssetInfo = this.config[this.fromNetwork];
      const { address: addressInfo, pub } = this.currentAccount
      const transferInfo = {
        fromChain: this.fromNetwork,
        toChain: this.toNetwork,
        fromAddress: addressInfo[this.fromNetwork],
        toAddress: addressInfo[this.toNetwork],
        amount: this.amount,
        pub,
        signAddress: addressInfo.Ethereum,
        // isTransferMainAsset: mainAssetInfo.symbol === transferAsset.symbol,
        transferAsset,
        // gasPrice: this.gasPrice,
        // gasLimit: this.gasLimit
      };

      // nerve nuls间跨链手续费
      const baseCrossFee = timesDecimals(crossFee, MAIN_INFO.decimal);
      const from = transferInfo.fromAddress;
      const to = transferInfo.toAddress;
      const nerveAddress = addressInfo.NERVE;
      const amount = timesDecimals(this.amount, transferAsset.decimals);
      const assetsId = transferAsset.nerveAssetId === 0 ? transferAsset.assetId : transferAsset.nerveAssetId; //nuls上的token资产通过getAssetNerveInfo查出来assetId为0
      // nerve nuls跨链
      const crossInfo = {
        from,
        to,
        assetsChainId: transferAsset.nerveChainId,
        assetsId,
        amount,
        fee: baseCrossFee,
        // type: 10
      }
      if (this.fromNetwork === "NERVE") {
        if (this.toNetwork === "NULS") {
          transferInfo.crossInfo = crossInfo
        } else {
          const proposalPrice = timesDecimals(
            this.withdrawalNVTFee,
            MAIN_INFO.decimal
          );
          const heterogeneousChain_Out = transferAsset.heterogeneousList.filter(
            (v) => v.chainName === this.toNetwork
          )[0];
          const txData = {
            heterogeneousAddress: addressInfo[this.toNetwork],
            heterogeneousChainId: heterogeneousChain_Out.heterogeneousChainId,
          };
          transferInfo.crossOutInfo = {
            from: nerveAddress,
            assetsChainId: transferAsset.nerveChainId,
            assetsId,
            amount,
            fee: 0,
            proposalPrice,
            txData,
            // type: 43
          }
        }
      } else if (this.fromNetwork === "NULS") {
        if (transferAsset.contractAddress) {
          // nuls合约资产跨链
          const price = 25;
          transferInfo.NULSContractInfo = {
            from,
            assetsChainId: NULS_INFO.chainId,
            assetsId: NULS_INFO.assetId,
            amount: Plus(20000000, Times(this.NULSContractGas, price)).toFixed(),
            toContractValue: 10000000,
            to: transferAsset.contractAddress,
            txData: this.NULSContractTxData,
            fee: timesDecimals(0.1, MAIN_INFO.decimal),
            // type: 16
          }
        } else {
          crossInfo.to = nerveAddress
          transferInfo.crossInfo = crossInfo
        }
        if (this.toNetwork !== "NERVE") {
          // 另外转入一笔nuls作为闪兑nvt手续费
          transferInfo.crossInForSwapInfo = {
            from,
            to: nerveAddress,
            assetsChainId: NULS_INFO.chainId,
            assetsId: NULS_INFO.assetId,
            amount: timesDecimals(this.extraFee, NULS_INFO.decimal),
            fee: baseCrossFee,
            // type: 10
          }
        }
      } else {
        // 异构链跨链转入nerve
        const heterogeneousChain_In = transferAsset.heterogeneousList.filter(
          (v) => v.chainName === this.fromNetwork
        )[0];
        transferInfo.crossInInfo = {
          multySignAddress: heterogeneousChain_In.heterogeneousChainMultySignAddress,
          nerveAddress: nerveAddress,
          numbers: this.amount,
          fromAddress: from,
          contractAddress: heterogeneousChain_In.contractAddress,
          decimals: transferAsset.decimals,
          gasLimit: this.gasLimit,
          gasPrice: this.gasPrice
        };
        if (this.toNetwork !== "NERVE") {
          // 另外转入一笔主资产作为闪兑nvt手续费
          transferInfo.crossInForSwapInfo = {
            multySignAddress: mainAssetInfo.config.crossAddress,
            nerveAddress: nerveAddress,
            numbers: this.extraFee,
            fromAddress: from,
            // contractAddress: mainAssetInfo.contractAddress,
            decimals: mainAssetInfo.decimal,
            gasLimit: gasLimitConfig.default,
            gasPrice: this.gasPrice
          };

        }
      }

      /*// 跨链转入
      // 提现
      let crossOutInfo
      if (this.withdrawalNVTFee) {
        const proposalPrice = timesDecimals(
          this.withdrawalNVTFee,
          MAIN_INFO.decimal
        );
        const heterogeneousChain_Out = transferAsset.heterogeneousList.filter(
          (v) => v.chainName === this.toNetwork
        )[0];
        const txData = {
          heterogeneousAddress: addressInfo[this.toNetwork],
          heterogeneousChainId: heterogeneousChain_Out.heterogeneousChainId,
        };
        crossOutInfo = {
          from: nerveAddress,
          assetsChainId: transferAsset.nerveChainId,
          assetsId,
          amount,
          fee: 0,
          proposalPrice,
          txData,
          // type: 43
        }
      }

      //手续费不够，需要闪兑
      let crossInForSwapInfo
      if (this.extraFee) {
        const fromChainInfo = this.config[this.fromNetwork];
        if (this.fromNetwork !== "NULS") {
          // 异构链跨链转入一笔主资产作为手续费
          crossInForSwapInfo = {
            multySignAddress: mainAssetInfo.config.crossAddress,
            nerveAddress: nerveAddress,
            numbers: this.extraFee,
            fromAddress: from,
            // contractAddress: mainAssetInfo.contractAddress,
            decimals: fromChainInfo.decimal,
            gasLimit: gasLimitConfig.default,
            gasPrice: this.gasPrice
          }
        } else {
          crossInForSwapInfo = {
            from,
            to: nerveAddress,
            assetsChainId: NULS_INFO.chainId,
            assetsId: NULS_INFO.assetId,
            amount: timesDecimals(this.extraFee, NULS_INFO.decimal),
            fee: baseCrossFee,
            // type: 10
          }
        }
      }

      if (this.fromNetwork === "NERVE") {
        if (this.toNetwork === "NULS") {
          transferInfo.crossInfo = crossInfo
        } else {
          transferInfo.crossOutInfo = crossOutInfo
        }
      } else if (this.fromNetwork === "NULS") {
        if (this.chooseAsset.contractAddress) {
          // nuls合约资产跨链
          const price = 25;
          transferInfo.NULSContractInfo = {
            from,
            assetsChainId: NULS_INFO.chainId,
            assetsId: NULS_INFO.assetId,
            amount: Plus(20000000, Times(this.NULSContractGas, price)).toFixed(),
            toContractValue: 10000000,
            to: transferAsset.contractAddress,
            txData: this.NULSContractTxData,
            fee: timesDecimals(0.1, MAIN_INFO.decimal),
            // type: 16
          }
        } else {
          crossInfo.to = nerveAddress
          transferInfo.crossInfo = crossInfo
        }
        if (this.toNetwork !== "NERVE") {
          if (this.extraFee) {
            transferInfo.crossInForSwapInfo = crossInForSwapInfo;
          }
          transferInfo.crossOutInfo = crossOutInfo
        }
      } else {
        // 异构链跨链转入nerve
        const heterogeneousChain_In = transferAsset.heterogeneousList.filter(
          (v) => v.chainName === this.fromNetwork
        )[0];
        transferInfo.crossInInfo = {
          multySignAddress: heterogeneousChain_In.heterogeneousChainMultySignAddress,
          nerveAddress: nerveAddress,
          numbers: this.amount,
          fromAddress: from,
          contractAddress: heterogeneousChain_In.contractAddress,
          decimals: transferAsset.decimals,
          gasLimit: this.gasLimit,
          gasPrice: this.gasPrice
        };
        if (this.toNetwork !== "NERVE") {
          if (this.extraFee) {
            transferInfo.crossInForSwapInfo = crossInForSwapInfo;
          }
          if (this.toNetwork !== "NULS") {
            transferInfo.crossOutInfo = crossOutInfo
          } else {
            crossInfo.from = nerveAddress
            transferInfo.crossInfo = crossInfo
          }
        }
      }*/
      sessionStorage.setItem("transferInfo", JSON.stringify(transferInfo));
      this.$router.push({
        name: "transfer",
      });
    },
    // 验证主资产余额是否够转账,手续费
    async checkAmountFee() {
      let flag = true;
      // 验证可用余额
      if (Minus(this.amount, this.available) > 0) {
        // 验证可用余额
        this.amountMsg = this.$t("home.home7");
        return;
      }
      const asset = this.chooseAsset;
      const assetSymbol = asset.symbol;
      const mainAssetInfo = this.config[this.fromNetwork]; // 发起链
      const isMainAsset = asset.chainId === mainAssetInfo.chainId && asset.assetId === mainAssetInfo.assetId;
      if (this.fromNetwork === "NERVE") {
        if (this.toNetwork === "NULS") {
          if (assetSymbol === "NULS") {
            if (Minus(Plus(this.amount, crossFee), this.available) > 0) flag = false;
          } else {
            const nulsBalance = await this.getNulsInfo(this.fromAddress);
            if (nulsBalance - crossFee < 0) flag = false;
          }
          flag = await this.checkFee(crossFee, isMainAsset)
        } else {
          const { value } = this.splitFeeSymbol(this.fee);
          flag = await this.checkFee(value, isMainAsset)
        }
      } else {
        const { value } = this.splitFeeSymbol(this.fee);
        flag = await this.checkFee(value, isMainAsset)
      }
      this.amountMsg = flag ? "" : this.$t("home.home7");
    },
    // 验证主资产是否够手续费/手续费+转账数量
    async checkFee(fee, isMainAsset) {
      let flag = true;
      const fromChainInfo = this.config[this.fromNetwork];
      const params = {
        chain: this.fromNetwork,
        address: this.fromAddress,
        chainId: fromChainInfo.chainId,
        assetId: fromChainInfo.assetId,
        contractAddress: ""
      };
      // fromChain主资产信息
      const fromChainMainAsset = await this.getAssetInfo(params);
      if (fromChainMainAsset) {
        const fromChainBalance = divisionDecimals(fromChainMainAsset.balance, fromChainMainAsset.decimals);
        if (isMainAsset) {
          if (Minus(Plus(this.amount, fee), this.available) > 0) flag = false;
        } else {
          if (Minus(fromChainBalance, fee) < 0) flag = false;
        }
      } else {
        flag = false
      }
      return flag
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    },
    getLogoSrc(url) {
      return getLogoSrc(url);
    },
    /**
     * 查询nerve链上nuls余额
     * @param address //nerveAddress
     */
    async getNulsInfo(address) {
      const data = {
        address,
        assetId: NULS_INFO.assetId,
        chainId: NULS_INFO.chainId,
        chain: "NERVE",
        refresh: true,
      }
      const res = await this.$request({
        url: "/wallet/address/asset",
        data
      });
      let balance = 0;
      if (res.code === 1000) {
        balance = divisionDecimals(res.data.balance, res.data.decimals);
      }
      return balance;
    },
    overflowToken(str) {
      return str;
      // return str.length > 6 ? str.slice(0, 6) + '...' : str
    },
    toTxDetail(txData) {
      this.$router.push({
        path: "/tx-detail",
        query: {
          txHash: txData.txHash
        }
      })
    }
  },
}

</script>
<style lang="less">
.nerve-swap {
  .pending-tx {
    margin: -10px 0 5px;
    text-align: right;
    span {
      font-size: 14px;
      font-weight: 600;
      color: #B8741A;
      cursor: pointer;
      border-bottom: 1px solid #B87419;
    }
  }
  .border-wrap {
    border: 1px solid #CED3E5;
    border-radius: 10px;
    padding: 0 20px 0 15px;
    margin-bottom: 20px;
  }
  .text-label {
    color: #99A3C4;
    font-size: 14px;
  }
  .mb_5 {
    margin-bottom: 5px;
  }
  .address-info {
    height: 122px;
    display: flex;
    align-items: center;
    .left {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      .dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background-color: #99A3C4;
        margin: 6px 0;
      }
    }
    .right {
      flex: 1;
      .from,.to {
        display: flex;
        align-items: center;
        height: 60px;
        .chain-logo {
          width: 25px;
          margin-right: 5px;
        }
        span {
          font-size: 15px;
          color: #99A3C4;
        }
        .chain-name {
          width: 85px;
        }
      }
      .to {
        position: relative;
        border-top: 1px solid #CED3E5;
        span {
          color: #515B7D;
          //font-weight: 600;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          color: #CED3E5;
        }
        .chain-list {
          left: 0;
          top: 40px;
        }
      }
    }
  }
  .origin-chain {
    display: inline-block;
    border: 1px solid #5BCAF9;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 16px;
    font-weight: normal;
    // margin-left: -6px;
    color: #5BCAF9;
    transform: translate(-20%, -10%) scale(0.5);
    //min-width: 45px;
    text-align: center;
  }
  .asset-info {
    .border-wrap {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .asset-placeholder {
      color: #c0c4cc;
      //color: #515B7D;
      font-size: 14px;
    }
    .el-icon-caret-bottom {
      color: #CED3E5;
    }
    .left {
      display: flex;
      align-items: center;
      .logo-img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 6px;
      }
      .asset-info-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        .symbol {
          line-height: 1;
          margin-bottom: 10px;
          display: inline-block;
          font-size: 14px;
          //font-weight: 600;
        }
        .origin-chain {
          position: absolute;
          top: 13px;
          left: -3px;
          padding: 0 8px;
        }
      }
    }
  }
  .amount-info {
    .label-wrap {
      display: flex;
      justify-content: space-between;
    }
    .border-wrap {
      height: 64px;
      border-color: #5BCAF9;
      margin-bottom: 0;
    }
    .amount-inner {
      .el-input__inner {
        height: 62px;
        line-height: 62px;
        border: none;
        padding: 0;
        font-size: 17px;
        font-weight: 600;
        color: #515B7D;
        &::-webkit-input-placeholder {
          color: #515B7D;
        }
      }
      .el-input-group__append {
        background-color: transparent;
        color: #5BCAF9;
        border: none;
        padding: 0;
      }
    }
  }
  .msg-wrap {
    position: relative;
    .from-validate-msg,
    .amount-validate-msg {
      position: absolute;
      color: #f56c6c;
      font-size: 12px;
      line-height: 1;
      padding-top: 4px;
    }
  }
  .fee {
    margin-top: 20px;
    margin-bottom: 30px;
    .label {
      color: #99A3C4;
      font-size: 14px;
    }
  }
  .btn-wrap {
    width: 100%;
    margin: 40px auto 0;
    .el-button {
      width: 100%;
      border-radius: 10px;
      padding: 16px 20px;
      height: 49px;
    }
  }
  .pending-tx-dialog {
    .tx-list ul {
      margin-top: 0;
    }
  }
}
</style>