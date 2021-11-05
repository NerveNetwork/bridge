<template>
  <div class="nerve-swap">
    <div class="account-select">
      <div class="from">
        <span class="label" :style="{width: $i18n.locale === 'en' ? '40px' : '30px'}">{{ $t("home.home4") }}</span>
<!--        <span class="network">
          {{ fromNetwork }}
        </span>-->
        <img :src="getChainLogo(fromNetwork)" alt="">
        {{ superLong(fromAddress) }}
      </div>
      <div class="msg-wrap">
        <span class="from-validate-msg" v-show="fromChainError">{{$t("home.home8") }}</span>
      </div>
      <div class="to click" @click="showNetworkList=!showNetworkList">
        <div class="left">
          <span class="label" :style="{width: $i18n.locale === 'en' ? '40px' : '30px'}">{{ $t("home.home5") }}</span>
          <img v-show="toNetwork" :src="getChainLogo(toNetwork)" alt="">
          <span class="address">{{ superLong(toAddress) }}</span>
        </div>

<!--        <el-select @change="selectChange" v-model="toNetwork" placeholder="">
          <el-option
            v-for="item in networkList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.value === fromNetwork"
          >
          </el-option>
        </el-select>-->

        <span :class="['el-icon-arrow-down', showNetworkList ? 'active' : '']"></span>
        <ChainList v-model="showNetworkList" :currentChain="toNetwork" @change="changeToChain" :disabledChain="fromNetwork"></ChainList>
      </div>
    </div>
    <div class="amount">
      <div class="label-wrap">
        <span class="label">{{ $t("public.amount") }}</span>
        <span class="label">{{ $t("home.home3") }} {{ available }}</span>
      </div>
      <el-input
        class="amount-inner"
        placeholder="0"
        :value="amount"
        @input="validateAmount"
      >
        <div
          class="select-asset-btn fw"
          slot="prepend"
          @click="assetListModal = true"
        >
          <template v-if="!chooseAsset">
            <span>{{ $t("home.home6") }}</span>
          </template>
          <template v-else>
            <!-- <span> -->
            <img
              class="logo-img"
              :src="getLogoSrc(chooseAsset.icon)"
              @error="replaceImg"
              alt=""
            />
            <div class="asset-info-wrap">
              <span style="line-height: 1;margin-bottom: 10px">{{ overflowToken(chooseAsset.symbol) }}</span>
<!--              <OriginChain :chain="chooseAsset.registerChain"></OriginChain>-->
              <span class="origin-chain">{{ chooseAsset.registerChain }}</span>
            </div>
          </template>
          <i class="el-icon-caret-bottom fw" style="margin-left: 3px"></i>
        </div>
        <el-button slot="append" @click="maxAmount">MAX</el-button>
      </el-input>
    </div>
    <div class="msg-wrap">
      <span class="amount-validate-msg" v-show="amountMsg">{{
        amountMsg
      }}</span>
    </div>
    <fee-wrap>
      <div class="fee-inner">
        <template v-if="!fee">
          <span v-if="!feeLoading"></span>
          <img v-else src="../../assets/img/loading.svg" alt="" />
        </template>
        <div v-else>
          {{ fee }}
          <el-checkbox v-model="speedUpFee" v-if="showSpeedUp">
            {{ $t("home.home11") }}
          </el-checkbox>
        </div>
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
    <div class="pending-tx-tip" v-if="hasPendingTx">{{ $t("home.home25") }}</div>
    <assets-dialog v-model="assetListModal" :list="assetsList" @selectAsset="selectAsset"></assets-dialog>
  </div>
</template>

<script>
import FeeWrap from "@/components/FeeWrap";
import AssetsDialog from "./AssetsDialog";
import ChainList from '@/components/ChainList';
import { MAIN_INFO, NULS_INFO, ETHNET } from "@/config";
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
  Division
} from "@/api/util";
import { ETransfer, getSymbolUSD, swapScale, swapSymbolConfig, crossFee, gasLimitConfig } from "@/api/api";
import { getContractCallData } from "@/api/nulsContractValidate";
import defaultIcon from "@/assets/img/commonIcon.png";
import {ethers} from 'ethers'

let chainToSymbol = {}
supportChainList.map(v => {
   chainToSymbol[v.value] = v.symbol
});

const config = JSON.parse(sessionStorage.getItem("config"))

export default {
  data () {
    this.networkList = supportChainList;
    this.withdrawalNVTFee = ""; // 提现nvt手续费
    this.extraFee = ""; //用于闪兑nvt的异构链主资产数量
    this.getFeeDebounce = debounce(this.getTransferFee, 1000)
    this.getAllowanceTimer = null; // 查询授权额度定时器
    this.currentAccount = null; // 当前连接的多链账户信息
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
      speedUpFee: false, //是否加速
      searchVal: "",
      filteredList: [],
      hasPendingTx: false,
      isMainAsset: false, // 是否为主资产
      maxClick: false, // 点击最大
      showNetworkList: false
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
    ChainList
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
    },
    speedUpFee() {
      this.getTransferFee();
    },
    assetListModal(val) {
      if (!val) {
        this.searchVal = ""
      }
    },
    searchVal(val) {
      if (val) {
        this.filteredList = this.assetsList.filter(v => {
          const search  = val.toUpperCase();
          const symbol = v.symbol.toUpperCase()
          const contractAddress = v.contractAddress.toUpperCase();
          // console.log(search, symbol, contractAddress, 45)
          return symbol.indexOf(search) > -1 || contractAddress === search
        })
      } else {
        this.filteredList = this.assetsList
      }
    },
    fee: {
      handler(val) {
        if (val) {
          const feeList = val.split('+');
          if (feeList.length > 1) {
            const { value } = this.splitFeeSymbol(feeList[1]);
            if (this.amount && this.maxClick) {
              if (Minus(this.available, value) < 0) {
                this.amountMsg = this.$t('home.home7');
                this.amount = this.available;
              } else {
                this.amount = Minus(this.available, value);
                this.checkAmountFee();
              }
            }
          } else {
            const { value } = this.splitFeeSymbol(feeList[0]);
            if (this.amount && this.isMainAsset && this.maxClick) {
              if (Minus(this.available, value) < 0) {
                this.amountMsg = this.$t('home.home7');
                this.amount = this.available;
              } else {
                this.amount = Minus(this.available, value);
                this.checkAmountFee();
              }
            }
          }
        }
      },
      deep: true
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
        this.fromChainError ||
        this.hasPendingTx
      )
        return false;
      return true;
    },
    networkPair() {
      return [this.fromNetwork, this.toNetwork];
    },
    showSpeedUp() {
      const parallelChain = ["NERVE", "NULS"]
      if (parallelChain.indexOf(this.fromNetwork) > -1 && parallelChain.indexOf(this.toNetwork) > -1) {
        return false
      }
      return true
    }
  },

  created() {
  },

  methods: {
    reset() {
      this.available = 0;
      this.amount = "";
      this.chooseAsset = null;
      this.assetsList = [];
      this.crossInAuth = false;
      this.speedUpFee = false;
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
        res.data.map(v => {
          // 去除ETH资产contractAddress为ETH
          v.contractAddress = v.contractAddress && v.assetId !== 1 ? v.contractAddress : "";
        })
        this.assetsList = res.data.sort((a, b) => {
          return a.symbol > b.symbol ? 1 : -1
        });
        this.filteredList = [...this.assetsList];
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
      const assetInfo = await this.getAssetInfo(params);
      if (assetInfo) {
        this.isMainAsset = config[this.fromNetwork].assetId === assetInfo.assetId && config[this.fromNetwork].chainId === assetInfo.chainId;
        this.available = divisionDecimals(assetInfo.balance, assetInfo.decimals);
      }
    },
    replaceImg(e) {
      e.target.src = defaultIcon;
    },
    maxAmount() {
      // TODO 主资产时先计算手续费，扣除手续费后再max
      this.maxClick = true;
      if (this.amount === this.available) return;
      this.validateAmount(this.available, true);
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
      }

      this.getFeeDebounce();
      // this.getTransferFee()
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
          } else if (this.toNetwork === "NULS") {
            // 默认闪兑3个nvt
            const swapNvtFee = withdrawalToNulsFee;
            // 再次转入的异构链主资产数量
            const hgcFee = await this.getSwapCost(swapNvtFee);
            const symbol = chainToSymbol[this.fromNetwork];
              this.extraFee = hgcFee;
            const oldCrossInFee = this.splitFeeSymbol(crossInFee).value;
            // 不考虑nerve到nuls的0.01 后台去处理
            this.fee = Plus(Times(oldCrossInFee, 2), hgcFee) + symbol;
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
      let fee
      if (this.speedUpFee) {
        fee = await transfer.getSpeedUpFee(gasLimit);
      } else {
        fee = await transfer.getGasPrice(gasLimit);
      }
      // this.gasPrice = ethers.utils.bigNumberify(fee).div(gasLimit)
      this.gasPrice = ethers.utils.parseUnits(Division(fee, gasLimit).toFixed(), '18').toHexString()
      return fee + chainToSymbol[this.fromNetwork];
    },
    // nerve转出到异构链手续费
    async getCrossOutFee() {
      const asset = this.chooseAsset;
      const assetHeterogeneousInfo = asset.heterogeneousList.filter(
        (v) => v.chainName === this.toNetwork
      )[0];
      const isToken = assetHeterogeneousInfo.token;
      const transfer = new ETransfer({chain: this.toNetwork});
      let nvtUSD = await getSymbolUSD("NERVE");
      nvtUSD = nvtUSD + "";
      let heterogeneousChainUSD = await getSymbolUSD(this.toNetwork);
      heterogeneousChainUSD = heterogeneousChainUSD + "";
      const res = await transfer.calWithdrawalNVTFee(
        nvtUSD,
        heterogeneousChainUSD,
        isToken
      );
      let nvtFee = divisionDecimals(res, 8); // 异构跨链手续费-nvt
      const type = this.speedUpFee ? "speed" : "normal"
      const scale = withdrawFeeRate[this.toNetwork][type];

      nvtFee = Times(nvtFee, scale).toString();
      console.log("-=-=-=-=-=-=-=-=-=-=-", nvtFee)
      this.withdrawalNVTFee = nvtFee;

      let fee;
      if (this.fromNetwork === "NERVE") {
        fee = nvtFee + "NVT";
      } else {
        // 统一收一笔主资产用作提现手续费
        const hgcFee = await this.getSwapCost(nvtFee);
        fee = hgcFee + chainToSymbol[this.fromNetwork];
      }
      return fee;
    },
    // 查询兑换一定数量nvt需要花费的异构链主资产数量
    async getSwapCost(amount) {
      const swapAssetInfo = config[this.fromNetwork];
      const nerveInfoParams = {
        assetsChainId: swapAssetInfo.chainId,
        assetsId: swapAssetInfo.assetId,
      };
      const { chainId, assetId } = await this.getAssetNerveInfo(nerveInfoParams);
      const swapAmount = timesDecimals(amount, 8).split(".")[0];
      const nerveAddress = this.currentAccount.address.NERVE;
      const params = {
        address: nerveAddress,
        toAmount: swapAmount,
        fromToken: {
          symbol: swapSymbolConfig[swapAssetInfo.symbol],
          chainId: chainId,
          assetId: assetId
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
      // const currentAccount = getCurrentAccount(this.address);
      const asset = this.chooseAsset;
      /* const nerveInfoParams = asset.contractAddress
        ? {
            contractAddress: asset.contractAddress,
          }
        : {
            assetsChainId: asset.chainId,
            assetsId: asset.assetId,
          }; */
      const nerveInfoParams = {
        contractAddress: asset.contractAddress,
        assetsChainId: asset.chainId,
        assetsId: asset.assetId,
      }
      const { nerveChainId: chainId, nerveAssetId: assetId } = this.chooseAsset;
      // const { chainId, assetId } = await this.getAssetNerveInfo(
      //   nerveInfoParams
      // );

      const mainAssetInfo = config[this.fromNetwork];
      const addressInfo = this.currentAccount.address
      const transferInfo = {
        fromChain: this.fromNetwork,
        toChain: this.toNetwork,
        fromAddress: addressInfo[this.fromNetwork],
        toAddress: addressInfo[this.toNetwork],
        chainId: asset.chainId,
        assetId: asset.assetId,
        contractAddress: asset.contractAddress,
        amount: this.amount,
        symbol: asset.symbol,
        pub: this.currentAccount.pub,
        signAddress: addressInfo.Ethereum,
        isTransferMainAsset: mainAssetInfo.symbol === asset.symbol,
        asset,
        gasPrice: this.gasPrice,
        gasLimit: this.gasLimit
      };

      const baseCrossFee = timesDecimals(crossFee, MAIN_INFO.decimal);
      const from = transferInfo.fromAddress;
      const to = transferInfo.toAddress;
      const nerveAddress = addressInfo.NERVE;
      const amount = timesDecimals(this.amount, asset.decimals);
      const assetsId = assetId === 0 ? asset.assetId : assetId; //nuls上的token资产通过getAssetNerveInfo查出来assetId为0
      // nerve nuls跨链
      const crossInfo = {
        from,
        to,
        assetsChainId: chainId,
        assetsId, 
        amount,
        fee: baseCrossFee,
        // type: 10
      }
      // 跨链转入
      // 提现
      let crossOutInfo
      if (this.withdrawalNVTFee) {
        const proposalPrice = timesDecimals(
          this.withdrawalNVTFee,
          MAIN_INFO.decimal
        );
        const heterogeneousChain_Out = asset.heterogeneousList.filter(
          (v) => v.chainName === this.toNetwork
        )[0];
        const txData = {
          heterogeneousAddress: addressInfo[this.toNetwork],
          heterogeneousChainId: heterogeneousChain_Out.heterogeneousChainId,
        };
        crossOutInfo = {
          from: nerveAddress,
          assetsChainId: chainId,
          assetsId,
          amount,
          fee: 0,
          proposalPrice,
          txData,
          // type: 43
        }
      }

      //手续费不够，需要闪兑
      let swapInfo, crossInForSwapInfo
      if (this.extraFee) {
        const fromChainInfo = config[this.fromNetwork];
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
          /*
          //  转入资产为nuls，再以nuls作为闪兑手续费，直接修改amount没有转入手续费hash 
          if (asset.chainId === NULS_INFO.chainId && asset.assetId === NULS_INFO.assetId) {
            // 跨链资产为NULS
            crossInfo.amount = timesDecimals(Plus(this.amount, this.extraFee), asset.decimals)
            crossInForSwapInfo = null;
          } */
        }
        const nerveInfoParams = {
          assetsChainId: fromChainInfo.chainId,
          assetsId: fromChainInfo.assetId,
        }
        const { nerveChainId: chainId, nerveAssetId: assetId } = this.chooseAsset;
        // const fromAssetOnNerve = await this.getAssetNerveInfo(
        //   nerveInfoParams
        // );
        swapInfo = {
          fromToken: {
            symbol: swapSymbolConfig[fromChainInfo.symbol],
            chainId,
            assetId
          },
          toToken: {
            symbol: "NVT",
            chainId: MAIN_INFO.chainId,
            assetId: MAIN_INFO.assetId
          },
          fromAmount: timesDecimals(this.extraFee, fromChainInfo.decimal),
          address: nerveAddress
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
          transferInfo.NULSContracInfo = {
            from,
            assetsChainId: NULS_INFO.chainId,
            assetsId: NULS_INFO.assetId,
            amount: Plus(20000000, Times(this.NULSContractGas, price)).toFixed(),
            toContractValue: 10000000,
            to: asset.contractAddress,
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
            transferInfo.swapInfo = swapInfo;
          }
          transferInfo.crossOutInfo = crossOutInfo
        }
      } else {
        // 异构链跨链转入nerve
        const heterogeneousChain_In = asset.heterogeneousList.filter(
          (v) => v.chainName === this.fromNetwork
        )[0];
        transferInfo.crossInInfo = {
          multySignAddress: heterogeneousChain_In.heterogeneousChainMultySignAddress,
          nerveAddress: nerveAddress,
          numbers: this.amount,
          fromAddress: from,
          contractAddress: heterogeneousChain_In.contractAddress,
          decimals: asset.decimals,
          gasLimit: this.gasLimit,
          gasPrice: this.gasPrice
        };
        if (this.toNetwork !== "NERVE") {
          if (this.extraFee) {
            transferInfo.crossInForSwapInfo = crossInForSwapInfo;
            transferInfo.swapInfo = swapInfo;
          }
          if (this.toNetwork !== "NULS") {
            transferInfo.crossOutInfo = crossOutInfo
          } else {
            crossInfo.from = nerveAddress
            transferInfo.crossInfo = crossInfo
          }
        }
      }
      sessionStorage.setItem("transferInfo", JSON.stringify(transferInfo));
      this.$router.push({
        name: "transfer",
      });
    },
    // 验证主资产余额是否够转账,手续费
    async checkAmountFee() {
      let flag = true;
      // 验证可用余额
      if (Minus(this.amount, this.available) > 0) flag = false;
      const asset = this.chooseAsset;
      const assetSymbol = asset.symbol;
      const feeList = this.fee.split("+");
      const mainAssetInfo = config[this.fromNetwork]; // 发起链
      const isMainAsset = assetSymbol === mainAssetInfo.symbol;

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
          // flag = this.checkFee(value, isMainAsset)
          flag = await this.checkFee(value, isMainAsset)
        }
      } else if (this.fromNetwork === "NULS") {
        let nulsFee
        feeList.map(v => {
          const { symbol, value } = this.splitFeeSymbol(v);
          if (symbol === "NULS") {
            nulsFee = value;
          }
        })
        flag = await this.checkFee(nulsFee, isMainAsset)
      } else {
        if (this.toNetwork === "NERVE") {
          const { value } = this.splitFeeSymbol(this.fee);
          flag = await this.checkFee(value, isMainAsset)
        } else {
          if (this.toNetwork === "NULS") {
            // 不验证0.01
            /* const currentAccount = getCurrentAccount(this.address);
            const nerveAddress = currentAccount.address.NERVE;
            const nulsBalance = await this.getNulsInfo(nerveAddress);
            if (nulsBalance - crossFee < 0) flag = false; */
          }
          let mainAssetFee
          feeList.map(v => {
            const { symbol, value } = this.splitFeeSymbol(v);
            if (symbol !== "NULS" && symbol !== "NVT") {
              mainAssetFee = value;
            }
          })
          flag = await this.checkFee(mainAssetFee, isMainAsset)
        }
      }
      this.amountMsg = flag ? "" : this.$t("home.home7");
    },
    // 验证主资产是否够手续费/手续费+转账数量
    async checkFee(fee, isMainAsset) {
      let flag = true;
      const fromChainInfo = config[this.fromNetwork];
      const params = {
        chain: this.fromNetwork,
        address: this.fromAddress,
        chainId: fromChainInfo.chainId,
        assetId: fromChainInfo.assetId,
        contractAddress: ""
      };
      const fromChainMainAsset = await this.getAssetInfo(params);
      if (fromChainMainAsset) {
        const fromChainBalance = divisionDecimals(fromChainMainAsset.balance, fromChainInfo.decimals);
        if (isMainAsset) {
          if (Minus(Plus(this.amount, fee), this.available) > 0) flag = false;
        } else {
          if (Minus(fromChainBalance, fee) < 0) flag = false;
        }
        // console.log(fromChainInfo, fee, isMainAsset, fromChainBalance, 2222,Minus(fromChainBalance, fee) < 0)
      } else {
        flag = false
      }
      return flag
    },
    superLong(str, len = 8) {
      return superLong(str, len);
    },
    getLogoSrc(url) {
      return getLogoSrc(url);
    },
    
    /**
     * 获取资产在nerve链上的信息
     * @param data.contractAddress //token资产合约地址
     * @param data.assetsChainId //非token资产链id
     * @param data.assetsId //非token资产资产id
     */
    async getAssetNerveInfo(data) {
      if (this.fromNetwork === "NULS" || this.fromNetwork === "NERVE") {
        return {
          chainId: data.assetsChainId,
          assetId: data.assetsId
        }
      }
      let result = null;
      let params = {};
      if (data.contractAddress) {
        const mainAsset = config[this.fromNetwork]; //来源链(eth,bnb,heco)主资产信息
        params = {
          chainId: mainAsset.chainId,
          contractAddress: data.contractAddress,
        };
      } else {
        params = { chainId: data.assetsChainId, assetId: data.assetsId };
      }
      //console.log(params);
      try {
        const res = await this.$request({
          url: "/asset/nerve/chain/info",
          data: params,
        });
        //console.log(res);
        if (res.code === 1000) {
          result = res.data;
        }
      } catch (e) {
        console.error(e);
      }
      return result;
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
      return str.length > 4 ? str.slice(0, 4) + '...' : str
    }
  },
}

</script>
<style lang="less">
.nerve-swap {
  .label-wrap .label:last-child {
    margin-right: 0;
  }
  .account-select {
    .from,.to {
      .label {
        display: inline-block;
        width: 30px
      }

    }
    .from {
      display: flex;
      align-items: center;
      img {
        width: 28px;
        margin: 0 60px 0 0;
      }
    }
    .to {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
        img {
          width: 28px;
          margin: 0 60px 0 0;
        }
      }
      .el-icon-arrow-down {
        font-weight: 600;
        transition: 0.1s linear;
        &.active {
          transform: rotate(-180deg);
        }
      }
      .chain-list {
        top: 50px;
      }
    }
  }
  .asset-info-wrap {
    position: relative;
    .origin-chain {
      position: absolute;
      top: 12px;
    }
  }

}
  .pending-tx-tip {
    font-size: 14px;
    text-align: center;
    margin-top: 20px;
    color: #f56c6c;
  }
</style>