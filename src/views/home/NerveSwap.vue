<template>
  <div class="nerve-swap" v-loading="loading">
<!--    <div class="pending-tx" v-if="pendingTxList.length">
      <span @click="pendingTxDialog=true">{{ $t('home.home27') + '(' + pendingTxList.length + ')' }}</span>
    </div>-->
    <div class="address-info border-wrap">
      <div class="left">
        <span class="text-label" style="margin-bottom: -2px;">{{ $t('home.home4') }}</span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="text-label">{{ $t('home.home5') }}</span>
      </div>
      <div class="right">
        <!--   fromAddress     -->
        <div class="from">
          <img class="chain-logo" :src="getChainLogo(fromNetwork)" alt="">
          <span class="chain-name">{{ fromNetwork }}</span>
          <span class="address">{{ superLong(fromAddress, 5) }}</span>
        </div>
        <!--   toAddress    -->
        <div class="to clicks" @click="showNetworkList=!showNetworkList">
          <img class="chain-logo" :src="getChainLogo(toNetwork)" alt="">
          <span class="chain-name">{{ toNetwork }}</span>
          <span class="address">{{ superLong(toAddress, 5) }}</span>
          <i class="el-icon-caret-bottom"></i>
          <ChainList v-model="showNetworkList" :currentChain="toNetwork" @change="changeToChain"
                     :disabledChain="fromNetwork"></ChainList>
        </div>
      </div>
    </div>
    <div class="asset-info">
      <div class="label-wrap mb_5">
        <span class="text-label">{{ $t('home.home6') }}</span>
      </div>
      <div class="border-wrap clicks" @click="assetListModal = true">
        <div class="left">
          <template v-if="!chooseAsset">
            <div class="asset-placeholder">
              {{ $t('home.home26') }}
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
        <span class="text-label">{{ $t('public.amount') }}</span>
        <span class="text-label">{{ $t('home.home3') }} {{ fixNumber(available) }}</span>
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
        <template v-else>
          <span v-if="fromNetwork === 'NERVE' && toNetwork === 'NULS'">
            {{ fee + 'NVT' + '+' + fee + 'NULS' }}
          </span>
          <span v-else>
            {{ fee }}{{ fromSymbol }}
          </span>
        </template>
      </div>
    </fee-wrap>
    <div class="btn-wrap tc">
      <el-button type="primary" v-if="crossInAuth" :disabled="!!fromChainError" @click="approveERC20">{{
          $t('home.home10')
        }}
      </el-button>
      <el-button type="primary" v-else :disabled="!canNext" @click="next">{{
          $t('public.next')
        }}
      </el-button>
    </div>
    <assets-dialog v-model="assetListModal" :list="assetsList" @selectAsset="selectAsset"></assets-dialog>
<!--    <el-dialog
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
    </el-dialog>-->
  </div>
</template>

<script>
import FeeWrap from '@/components/FeeWrap';
import AssetsDialog from './AssetsDialog';
import ChainList from '@/components/ChainList';
import TxList from '@/components/TxList';
import { MAIN_INFO, NULS_INFO } from '@/config';
import {
  debounce,
  Division,
  divisionDecimals,
  fixNumber,
  getChainConfigs,
  getCurrentAccount,
  getLogoSrc,
  getMultySignAddress,
  Minus,
  Plus,
  superLong,
  Times,
  timesDecimals,
  isBeta
} from '@/api/util';
import { crossFee, ETransfer, getEVMBalance, getNAssetInfo, getNBalance, NTransfer } from '@/api/api';
import TronLinkApi from '@/api/tronApi';
import { getContractCallData } from '@/api/nulsContractValidate';
import defaultIcon from '@/assets/img/commonIcon.png';
import { getERC20AssetsBalance, getNAssetsBalance, getTRC20AssetsBalance } from '@/api/getBalanceInBatch';
import { getCrossAddress } from '@/api/getDefaultConfig';


export default {
  data() {
    this.getFeeDebounce = debounce(this.getTransferFee, 1000);
    this.getAllowanceTimer = null; // 查询授权额度定时器
    this.currentAccount = null; // 当前连接的多链账户信息
    this.pendingTxTimer = null;
    this.crossOutFee = ''; // 后台返回的跨链手续费
    this.orderId = ''; // 订单ID
    this.crossNulsAddress = ''; // nuls中转地址  nuls到异构链需将手续费转入此地址
    this.crossNerveAddress = ''; // nerve 中转地址
    return {
      loading: false,
      toNetwork: '',
      assetListModal: false,
      assetsList: [], //可跨链资产
      chooseAsset: null, // 选择的跨链资产
      amount: '', //跨链数量
      available: 0,
      fee: '',
      feeLoading: false,
      amountMsg: '', //转账数量验证失败信息
      crossInAuth: false, //异构链转入nerve是否需要授权
      isMainAsset: false, // 是否为主资产
      showNetworkList: false,
      pendingTxList: [], //未转入手续费待处理交易
      pendingTxDialog: false
    };
  },

  props: {
    address: String,
    fromNetwork: String,
    fromAddress: String
  },
  components: {
    FeeWrap,
    AssetsDialog,
    ChainList,
    // TxList
  },
  watch: {
    address: {
      immediate: true,
      handler(val) {
        if (!val) return;
        this.reset();
        this.toNetwork = '';
        this.currentAccount = getCurrentAccount(val);
      }
    },
    toNetwork(val) {
      if (val) {
        this.reset();
        this.getCanCrossAssets();
      }
    }
  },

  computed: {
    fromChainError() {
      return this.$store.state.isWrongChain;
    },
    toAddress() {
      return this.currentAccount ? this.currentAccount.address[this.toNetwork] : '';
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
    configs() {
      return this.$store.state.config;
    },
    fromSymbol() {
      return this.configs[this.fromNetwork].symbol;
    },
    fromChainMultySignAddress() {
      // console.log(getMultySignAddress(this.fromNetwork), 77);
      return getMultySignAddress(this.fromNetwork);
    }
  },

  async mounted() {
    /*this.getPendingTxList();
    const timer = setInterval(() => {
      this.getPendingTxList();
    }, 5000);
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer);
    });*/
    this.getCrossAddressMap();
    // const instance1 = await window.tronWeb.contract().at('414edb3b591c27aa3efe30f267690bf7ff2556d85c');
    // console.log(instance1, '222222');

    window.tronWeb.request({
      method: 'eth_estimateGas',
      params: [{
        from: 'TTaJsdnYPsBjLLM1u2qMw1e9fLLoVKnNUX',
        to: 'TUJLt6hAthpKhkmAAapWczUHhxN2TzY3cF',
        data: '0a0299b022082eb8420a47fb3fdd40909ffffc86305aae01081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541c11d9943805e56b630a401d4bd9a29550353efa1121541f58579d0c4f39d6c327978a0a3e95ce4dec196092244095ea7b3000000000000000000000000f723e62e48f4e0a5160ebaf69a60d7244e462a05ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff709dd9fbfc8630900180a3c347'
      }]
    })
  },

  methods: {
    // 查询未确认交易
    async getPendingTxList() {
      const currentAccount = getCurrentAccount(this.address);
      const addressObj = currentAccount.address;
      const data = {
        chain: this.fromNetwork,
        address: addressObj[this.fromNetwork],
      };
      const res = await this.$request({
        url: '/bridge/tx/query',
        data
      });
      if (res.code === 1000) {
        const list = [];
        res.data.map(v => {
          v.createTime = v.createTime.substring(5);
          const { status } = v;
          if ( status < 3) {
            list.push(v);
          }
        });
        this.pendingTxList = list;
      }
    },

    reset() {
      this.available = 0;
      this.amount = '';
      this.amountMsg = '';
      this.chooseAsset = null;
      this.assetsList = [];
      this.crossInAuth = false;
      this.isMainAsset = false;
      this.fee = '';
      this.feeLoading = false;
      this.clearGetAllowanceTimer();
    },

    changeToChain(item) {
      this.toNetwork = item.chain;
    },

    getChainLogo(chain) {
      if (!chain) return null;
      const config = getChainConfigs();
      const chainInfo = Object.values(config).find(item => item.chain === chain);
      return chainInfo ? chainInfo.icon : null;
    },

    // 查询可跨链资产
    async getCanCrossAssets() {
      const res = await this.$request({
        url: '/bridge/cross/asset',
        data: {
          fromChain: this.fromNetwork,
          toChain: this.toNetwork
        }
      });
      if (res.code === 1000) {
        const data = res.data;
        this.assetsList = data.sort((a, b) => {
          return a.symbol.toLowerCase() > b.symbol.toLowerCase() ? 1 : -1;
        });
        const config = getChainConfigs();
        const psUrl = config[this.fromNetwork].apiUrl;
        data.map(v => {
          // 去除ETH资产contractAddress为ETH
          v.contractAddress = v.contractAddress && v.assetId !== 1 ? v.contractAddress : '';
        });
        if (this.fromNetwork === 'NERVE' || this.fromNetwork === 'NULS') {
          let assetsInfo;
          if (this.fromNetwork === 'NERVE') {
            assetsInfo = data.map(v => {
              return {
                chainId: v.chainId,
                assetId: v.assetId
              };
            });
          } else {
            assetsInfo = data.map(v => {
              return {
                chainId: v.chainId,
                assetId: v.assetId,
                contractAddress: v.contractAddress || ''
              };
            });
          }
          const chainId = config[this.fromNetwork].chainId;
          const tokenInfo = await getNAssetsBalance(psUrl, chainId, this.fromAddress, assetsInfo);
          data.map(v => {
            tokenInfo.map(token => {
              if (v.chainId === token.assetChainId && v.assetId === token.assetId) {
                v.balance = divisionDecimals(token.balance, v.decimals);
                v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
              }
            });
          });
          console.log(tokenInfo, 'tokenInfo-nerve');
        } else {
          const multiCallAddress = config[this.fromNetwork].config.multiCallAddress;
          const contractList = data.map(v => {
            return v.contractAddress || multiCallAddress;
          });
          const tokenInfo = this.fromNetwork === 'TRON'
            ? await getTRC20AssetsBalance(contractList, this.fromAddress, multiCallAddress, psUrl)
            : await getERC20AssetsBalance(contractList, this.fromAddress, multiCallAddress, psUrl);
          console.log(tokenInfo, "tokenInfo-erc")
          data.map(v => {
            tokenInfo.map(token => {
              if (v.contractAddress) {
                if (v.contractAddress === token.contractAddress) {
                  v.balance = divisionDecimals(token.balance, token.decimals);
                  v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
                }
              } else {
                if (!token.contractAddress) {
                  v.balance = divisionDecimals(token.balance, 18);
                  v.fixedBalance = v.balance ? fixNumber(v.balance, 6) : 0;
                }
              }
            });
          });
        }
        this.assetsList = data.sort((a, b) => {
          if (a.balance > 0 || b.balance > 0) {
            return b.balance - a.balance > 0 ? 1 : -1;
          } else {
            return a.symbol.toLowerCase() > b.symbol.toLowerCase() ? 1 : -1;
          }
        });
      }
    },
    // 下拉选择资产
    async selectAsset(asset) {
      this.available = 0;
      this.amount = '';
      this.amountMsg = '';
      this.crossInAuth = false;
      this.isMainAsset = false;
      this.fee = '';
      this.chooseAsset = asset;
      this.crossOutFee = '';
      this.orderId = '';
      this.clearGetAllowanceTimer();
      this.getCrossOutFeeAndOrderId();
      //assset.assetId为0 则为异构链上token资产
      if (asset.assetId === 0 && this.fromNetwork !== 'NULS') {
        this.checkCrossInAuthStatus();
      }
      const fromChainInfo = this.configs[this.fromNetwork];
      this.isMainAsset = fromChainInfo.assetId === asset.assetId && fromChainInfo.chainId === asset.chainId;
      if (asset.balance && Number(asset.balance)) {
        this.available = asset.balance;
      } else {
        this.available = await this.getAssetBalance(this.fromNetwork, this.fromAddress, asset);
      }
    },
    replaceImg(e) {
      e.target.src = defaultIcon;
    },
    maxAmount() {
      // TODO 主资产时先计算手续费，扣除手续费后再max
      if (this.amount === this.available) return;
      this.amount = this.available;
      this.getFeeDebounce();
    },

    // 获取跨链手续费(异构链到异构链，nerve到异构链，其他返回都是0) orderId
    async getCrossOutFeeAndOrderId() {
      const res = await this.$request({
        url: '/bridge/fee',
        data: {
          fromChain: this.fromNetwork,
          toChain: this.toNetwork
        }
      });
      if (res && res.code === 1000) {
        const {crossFee, orderId} = res.data;
        this.crossOutFee = crossFee;
        this.orderId = orderId;
      }
    },

    // 查询异构链token资产授权情况
    async checkCrossInAuthStatus() {
      let needAuth = false;
      const contractAddress = this.chooseAsset.contractAddress;
      if (this.fromNetwork === 'TRON') {
        const transfer = new TronLinkApi();
        needAuth = await transfer.getTrc20Allowance(this.fromAddress, this.fromChainMultySignAddress, contractAddress)
      } else {
        const transfer = new ETransfer();
        needAuth = await transfer.getERC20Allowance(
          contractAddress,
          this.fromChainMultySignAddress,
          this.fromAddress
        );
      }
      this.crossInAuth = needAuth;
      if (!needAuth && this.getAllowanceTimer) {
        this.getTransferFee();
        this.clearGetAllowanceTimer();
      }
    },
    // 异构链token资产转入nerve授权
    async approveERC20() {
      try {
        const userAddress = this.fromAddress;
        const multySignAddress = this.fromChainMultySignAddress;
        const contractAddress = this.chooseAsset.contractAddress;
        let hash
        if (this.fromNetwork === 'TRON') {
          const transfer = new TronLinkApi();
          hash = await transfer.approveTrc20(userAddress, multySignAddress, contractAddress)
          // console.log(hash, '90999');
        } else {
          const transfer = new ETransfer();
          const res = await transfer.approveERC20(
            contractAddress,
            multySignAddress,
            userAddress
          );
          hash = res.hash
        }
        if (hash) {
          this.$message({
            message: this.$t('tips.tips1'),
            type: 'success',
            duration: 2000
          });
          this.setGetAllowanceTimer();
        } else {
          this.$message({message: JSON.stringify(res), type: 'warning', duration: 2000});
        }
      } catch (e) {
        this.$message({message: e.message || e, type: 'warning', duration: 2000});
      }

    },
    // 定时获取授权状态
    setGetAllowanceTimer() {
      this.getAllowanceTimer = setInterval(() => {
        this.checkCrossInAuthStatus();
      }, 3000);
    },
    // 清除获取授权状态定时器
    clearGetAllowanceTimer() {
      if (!this.getAllowanceTimer) return;
      clearInterval(this.getAllowanceTimer);
      this.getAllowanceTimer = null;
    },
    async getAssetBalance(chain, address, asset) {
      const { chainId, assetId, decimals, contractAddress } = asset;
      if (chain === 'NULS' || chain === 'NERVE') {
        return await getNBalance(chain, address, chainId, assetId, contractAddress, decimals);
      } else if (chain === 'TRON') {
        const transfer = new TronLinkApi();
        return contractAddress ? await transfer.getTrc20Balance(address, contractAddress, decimals) : await transfer.getTrxBalance(address)
      } else {
        return await getEVMBalance(chain, address, contractAddress, decimals);
      }
    },
    validateAmount(val) {
      const decimals = this.chooseAsset && this.chooseAsset.decimals || 8;
      const patrn = new RegExp('^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$');
      if (patrn.exec(val) || val === '') {
        this.amount = val;
        this.getFeeDebounce();
      }
    },
    // 计算交易手续费
    async getTransferFee() {
      if (this.crossInAuth) return;
      try {
        this.fee = '';
        if (!this.chooseAsset || !Number(this.amount)) {
          this.feeLoading = false;
          return;
        }
        this.feeLoading = true;
        if (this.fromNetwork === 'NERVE') {
          if (this.toNetwork === 'NULS') {
            this.fee = crossFee;
          } else {
            this.fee = this.crossOutFee;
          }
        } else if (this.fromNetwork === 'NULS') {
          let crossInFee = crossFee + 0.001;
          if (this.chooseAsset.contractAddress) {
            crossInFee = await this.getContractCallData();
          }
          this.fee = Plus(crossInFee, this.crossOutFee).toFixed();
        } else {
          const crossInFee = await this.getCrossInFee();
          console.log(crossInFee, this.crossOutFee, 777);
          this.fee = Plus(crossInFee, this.crossOutFee).toFixed();
        }
        await this.checkAmountFee();
      } catch (e) {
        this.$message.error(this.$t('tips.tips21'))
        console.error(e, '计算手续费失败');
      }
      this.feeLoading = false;
    },
    // 验证主资产余额是否够转账,手续费
    async checkAmountFee() {
      let flag = true;
      // 验证可用余额
      if (Minus(this.amount, this.available) > 0) {
        this.amountMsg = this.$t('home.home7');
        return;
      }
      const asset = this.chooseAsset;
      const assetSymbol = asset.symbol;
      const mainAssetInfo = this.configs[this.fromNetwork]; // 发起链
      const isMainAsset = asset.chainId === mainAssetInfo.chainId && asset.assetId === mainAssetInfo.assetId;
      flag = await this.checkFee(this.fee, isMainAsset);
      if (this.fromNetwork === 'NERVE') {
        if (this.toNetwork === 'NULS') {
          if (assetSymbol === 'NULS') {
            if (Minus(Plus(this.amount, crossFee), this.available) > 0) flag = false;
          } else {
            const nulsBalance = await getNBalance('NULS', this.toAddress, NULS_INFO.chainId, NULS_INFO.assetId, '', 8);
            if (nulsBalance - crossFee < 0) flag = false;
          }
        }
      }
      this.amountMsg = flag ? '' : this.$t('home.home7');
    },
    // 验证主资产是否够手续费/手续费+转账数量
    async checkFee(fee, isMainAsset) {
      let flag = true;
      const fromChainInfo = this.configs[this.fromNetwork];
      const fromChainBalance = await this.getAssetBalance(this.fromNetwork, this.fromAddress, {
        contractAddress: '',
        chainId: fromChainInfo.chainId,
        assetId: fromChainInfo.assetId,
        decimals: fromChainInfo.decimal
      });
      if (fromChainBalance) {
        if (isMainAsset) {
          if (Minus(Plus(this.amount, fee), this.available) > 0) flag = false;
        } else {
          if (Minus(fromChainBalance, fee) < 0) flag = false;
        }
      } else {
        flag = false;
      }
      return flag;
    },
    //nuls合约资产跨链 计算手续费 & txData
    async getContractCallData() {
      const res = await getContractCallData(
        this.fromAddress,
        this.crossNerveAddress,
        '',
        this.chooseAsset.contractAddress,
        'transferCrossChain',
        this.amount,
        this.chooseAsset.decimals
      );
      // console.log(res, 88);
      if (res.success) {
        const { gasLimit, price } = res.data.contractCallData;
        this.NULSContractGas = gasLimit;
        this.NULSContractTxData = res.data.contractCallData;
        // console.log(gasLimit, price, Plus(Division(Times(gasLimit, price), 10000000), 0.001).toFixed());
        // getContractCallData内部计算时已加上跨链需要的0.01个手续费
        // return Plus(Division(Times(gasLimit, price), 100000000), 0.001).toFixed();
        return divisionDecimals(Plus(10100000, Times(gasLimit, price)), 8) // 10000000 + 100000 + gas * price
      } else {
        this.$message({message: res.msg, type: 'warning', duration: 2000});
        throw 'Calculate contractCall fee error'
      }
    },
    // 异构链转入nerve手续费
    async getCrossInFee() {
      const assetHeterogeneousInfo = this.chooseAsset.heterogeneousList.filter(
        (v) => v.chainName === this.fromNetwork
      )[0];
      const { contractAddress } = assetHeterogeneousInfo;
      const addressInfo = this.currentAccount.address;
      if (this.fromNetwork === 'TRON') {
        const transfer = new TronLinkApi();
        return await transfer.getCrossInFee(
          addressInfo[this.fromNetwork],
          addressInfo.NERVE,
          this.amount,
          this.fromChainMultySignAddress,
          contractAddress,
          this.chooseAsset.decimals,
          this.orderId,
          this.crossOutFee
        )
      } else {
        const transfer = new ETransfer();
        const tx = await transfer.crossInII({
          fromAddress: addressInfo[this.fromNetwork],
          multySignAddress: this.fromChainMultySignAddress,
          nerveAddress: addressInfo.NERVE,
          numbers: this.amount,
          contractAddress,
          decimals: this.chooseAsset.decimals,
          crossChainFee: this.crossOutFee,
          orderId: this.orderId
        }, true)
        // tx.from = addressInfo[this.fromNetwork]; // cronos不传from预估gasLimit失败
        const gasLimit = await transfer.estimateGas(tx);
        this.gasLimit = gasLimit.toHexString();
        // this.gasPrice = ethers.utils.parseUnits(Division(fee, gasLimit).toFixed(), '18').toHexString();
        return await transfer.getGasPrice(gasLimit);
      }
    },

    /*splitFeeSymbol(str) {
      str = str + '';
      return {
        symbol: str.match(/[a-z|A-Z]+/gi)[0],
        value: str.match(/[\d|.]+/gi)[0]
      };
    },*/
    // 获取nerve中转地址
    async getCrossAddressMap() {
      const crossAddressMap = await getCrossAddress();
      /*if (!crossAddressMap || !crossAddressMap.crossNerveAddress || !crossAddressMap.crossNulsAddress) {
        throw this.$t("tips.tips18")
      }*/
      this.crossNulsAddress = crossAddressMap.crossNulsAddress;
      this.crossNerveAddress = crossAddressMap.crossNerveAddress;
    },
    async next() {
      try {
        this.loading = true;
        await this.createOrder();
        const transferAsset = this.chooseAsset;
        const { address: addressInfo, pub } = this.currentAccount;

        const from = addressInfo[this.fromNetwork];
        const nerveAddress = addressInfo.NERVE;
        const amount = timesDecimals(this.amount, transferAsset.decimals);
        const signAddress = addressInfo.Ethereum;

        if (this.fromNetwork === 'NERVE' || this.fromNetwork === 'NULS') {
          const { nerveChainId: assetsChainId, nerveAssetId: assetsId, contractAddress } = transferAsset;

          let transferInfo = {
            from,
            to: this.crossNerveAddress,
            assetsChainId,
            assetsId,
            amount,
            fee: 0
          }, type = 2, txData = {};
          if (this.fromNetwork === 'NERVE') {
            if (!this.crossNerveAddress) throw this.$t('home.home31')
            // 只做普通转账交易、将手续费和转账资产转到nerve中转地址
            type = 2;
          } else {
            if (!this.crossNulsAddress) throw this.$t('home.home31')
            if (contractAddress) {
              type = 16;
              const price = 25;
              transferInfo = {
                from,
                assetsChainId: NULS_INFO.chainId,
                assetsId: NULS_INFO.assetId,
                amount: Plus(10000000, Times(this.NULSContractGas, price)).toFixed(), // 计算input output函数里面再加上0.001
                toContractValue: 10000000,
                to: contractAddress,
                nulsValueToOthers: [{ // 往nuls中转地址转的nuls数量
                  value: timesDecimals(this.crossOutFee, 8),
                  address: this.crossNulsAddress
                }]
              }
              if (!this.crossOutFee) {
                delete transferInfo.nulsValueToOthers;
              }
              txData = this.NULSContractTxData
            } else {
              // 只做普通转账交易、将手续费和转账资产转到nuls中转地址
              transferInfo.to = this.crossNulsAddress;
              transferInfo.fee = timesDecimals(0.001, 8);
            }
          }
          const transfer = new NTransfer({ chain: this.fromNetwork, type })
          let inputOutput = await transfer.inputsOrOutputs(transferInfo);
          // 特殊处理从nerve发起的跨链交易inputoutput
          if (this.fromNetwork === 'NERVE') {
            inputOutput = await this.handleNerveCross(inputOutput, from, this.crossNerveAddress);
          }
          if (this.fromNetwork === 'NULS' && !contractAddress) {
            inputOutput = await this.handleNulsCross(inputOutput, from, this.crossNulsAddress)
          }
          const data = {
            inputs: inputOutput.inputs,
            outputs: inputOutput.outputs,
            txData,
            pub,
            signAddress,
            remarks: this.orderId
          };
          // console.log(data, '----data----');
          const txHex = await transfer.getTxHex(data);
          // console.log(txHex, 777);
          // throw '22'
          const broadcastRes = await this.broadcastHex(txHex);
          if (broadcastRes.hash) {
            await this.updateOrder(broadcastRes.hash);
          }
        } else {
          if (!this.crossNerveAddress) throw this.$t('home.home31');
          // 异构链跨链转入nerve/异构链到异构链
          const heterogeneousChain_In = transferAsset.heterogeneousList.filter(
            (v) => v.chainName === this.fromNetwork
          )[0];
          const nerveAddress = this.crossNerveAddress;
          const multySignAddress = this.fromChainMultySignAddress;
          const contractAddress = heterogeneousChain_In.contractAddress;
          const decimals = transferAsset.decimals;
          let hash;
          if (this.fromNetwork === 'TRON') {
            const transfer = new TronLinkApi();
            hash = await transfer.crossOutToNerve(
              nerveAddress,
              this.amount,
              multySignAddress,
              contractAddress,
              decimals,
              this.orderId,
              this.crossOutFee
            )
            // TODO 交易成功报: 失败,修改跨链交易错误
          } else {
            const params = {
              multySignAddress,
              nerveAddress,
              numbers: this.amount,
              fromAddress: from,
              contractAddress,
              decimals,
              gasLimit: this.gasLimit,
              crossChainFee: this.crossOutFee,
              orderId: this.orderId,
            };
            // console.log(params, 888);
            const transfer = new ETransfer();
            const res = await transfer.crossInII(params);
            hash = res.hash;
          }
          if (hash) {
            await this.updateOrder(hash);
          }
        }
      } catch (e) {
        console.log(e, 888);
        this.amount = '';
        this.fee = '';
        await this.getCrossOutFeeAndOrderId();
        this.$message.error(e.message || e);
      }
      this.loading = false;
    },
    // 创建订单
    async createOrder() {
      const data = {
        orderId: this.orderId,
        fromChain: this.fromNetwork,
        fromAddress: this.fromAddress,
        toChain: this.toNetwork,
        toAddress: this.toAddress,
        chainId: this.chooseAsset.chainId,
        assetId: this.chooseAsset.assetId,
        contractAddress: this.chooseAsset.contractAddress,
        amount: this.amount,
        crossFee: this.crossOutFee
      }
      const res = await this.$request({
        url: '/bridge/tx/save',
        data
      })
      if (res.code !== 1000) {
        throw this.$t('home.home30')
      }
    },
    // nerve跨链到nuls、异构链特殊处理input output
    // 将手续费转到nerve中转地址
    async handleNerveCross(data, from, to) {
      const { inputs, outputs } = data;
      const { nerveChainId: assetsChainId, nerveAssetId: assetsId } = this.chooseAsset;
      const NERVEInfo = this.configs.NERVE;
      const { chainId: NerveChainId, assetId: NerveAssetId } = NERVEInfo;
      const NULSInfo = this.configs.NULS;
      const { chainId: NulsChainId, assetId: NulsAssetId } = NULSInfo;
      const NVTNonce = await this.getNonce('NERVE', from, NerveChainId, NerveAssetId);
      if (this.toNetwork === 'NULS') {
        const feeAmount = timesDecimals(crossFee, 8);
        const NULSNonce = await this.getNonce('NERVE', from, NulsChainId, NulsAssetId);
        if (assetsChainId === NerveChainId && assetsId === NerveAssetId) {
          const newNvtAmount = Plus(inputs[0].amount, feeAmount).toFixed();
          inputs[0].amount = newNvtAmount;
          outputs[0].amount = newNvtAmount;
          inputs.push({
            address: from,
            assetsChainId: NulsChainId,
            assetsId: NulsAssetId,
            amount: feeAmount,
            locked: 0,
            nonce: NULSNonce
          })
          outputs.push({
            address: to,
            assetsChainId: NulsChainId,
            assetsId: NulsAssetId,
            amount: feeAmount,
            lockTime: 0
          })
        } else if (assetsChainId === NulsChainId && assetsId === NulsAssetId) {
          const newNulsAmount = Plus(inputs[0].amount, feeAmount).toFixed();
          inputs[0].amount = newNulsAmount;
          outputs[0].amount = newNulsAmount;
          inputs.push({
            address: from,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            locked: 0,
            nonce: NVTNonce
          })
          outputs.push({
            address: to,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            lockTime: 0
          })
        } else {
          inputs.push({
            address: from,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            locked: 0,
            nonce: NVTNonce
          },
          {
            address: from,
            assetsChainId: NulsChainId,
            assetsId: NulsAssetId,
            amount: feeAmount,
            locked: 0,
            nonce: NULSNonce
          })
          outputs.push({
            address: to,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            lockTime: 0
          },
          {
            address: to,
            assetsChainId: NulsChainId,
            assetsId: NulsAssetId,
            amount: feeAmount,
            lockTime: 0
          })
        }
      } else {
        const feeAmount = timesDecimals(this.crossOutFee, 8);
        if (assetsChainId === NerveChainId && assetsId === NerveAssetId) {
          const newNvtAmount = Plus(inputs[0].amount, feeAmount).toFixed();
          inputs[0].amount = newNvtAmount;
          outputs[0].amount = newNvtAmount;
        } else {
          inputs.push({
            address: from,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            locked: 0,
            nonce: NVTNonce
          })
          outputs.push({
            address: to,
            assetsChainId: NerveChainId,
            assetsId: NerveAssetId,
            amount: feeAmount,
            lockTime: 0
          })
        }
      }
      console.log(inputs, outputs);
      return { inputs, outputs }
    },
    // 特殊处理nuls跨链, 合约资产前面已经处理了， 转到nerve中转地址
    async handleNulsCross(data, from, to) {
      const { inputs, outputs } = data;
      const { nerveChainId: assetsChainId, nerveAssetId: assetsId } = this.chooseAsset;
      const NULSInfo = this.configs.NULS;
      const { chainId: NulsChainId, assetId: NulsAssetId } = NULSInfo;
      const fee = Plus(crossFee, this.crossOutFee).toFixed(); // 到nerve crossOutFee === 0
      const feeAmount = timesDecimals(fee, 8);
      if (assetsChainId === NulsChainId && assetsId === NulsAssetId) {
        const amount = inputs[0].amount;
        const txSizeFee = timesDecimals(0.001, 8);
        inputs[0].amount = Plus(amount, feeAmount).toFixed();
        outputs[0].amount = Minus(inputs[0].amount, txSizeFee).toFixed();
      } else {
        inputs.forEach(input => {
          if (input.assetsChainId === NulsChainId && input.assetsId === NulsAssetId) {
            const amount = input.amount;
            input.amount = Plus(amount, feeAmount).toFixed();
          }
        })
        outputs.push({
          address: to,
          assetsChainId: NulsChainId,
          assetsId: NulsAssetId,
          amount: feeAmount,
          lockTime: 0
        })
      }
      return { inputs, outputs }
    },
    async getNonce(chain, address, assetChainId, assetId) {
      const assetInfo = await getNAssetInfo(chain, address, assetChainId, assetId);
      if (assetInfo) {
        return assetInfo.nonce;
      } else {
        throw 'Get nonce error'
      }
    },
    //广播nerve nuls交易
    async broadcastHex(txHex) {
      const chainInfo = this.configs[this.fromNetwork];
      const { apiUrl, chainId } = chainInfo;
      const res = await this.$post(apiUrl, 'broadcastTx', [chainId, txHex]);
      if (res.result && res.result.hash) {
        return { hash: res.result.hash };
      } else {
        throw this.$t("tips.tips17")
      }
    },
    async updateOrder(txHash) {
      const data = {
        orderId: this.orderId,
        txHash
      }
      const res = await this.$request({
        url: '/bridge/tx/hash/update',
        data
      })
      if (res.code !== 1000) {
        throw this.$t('tips.tips20') + res.msg
      } else {
        this.$message({
          message: this.$t("tips.tips1"),
          type: "success",
          duration: 2000
        })
        setTimeout(() => {
          this.toTxDetail(this.orderId)
        }, 2000)
      }
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    },
    getLogoSrc(url) {
      return getLogoSrc(url);
    },
    overflowToken(str) {
      return str;
      // return str.length > 6 ? str.slice(0, 6) + '...' : str
    },
    toTxDetail(orderId) {
      this.$router.push({
        path: '/tx-detail',
        query: {
          orderId
        }
      });
    },
    fixNumber(num) {
      return fixNumber(num);
    }
  }
};

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
      margin-right: 10px;

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

      .from, .to {
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
          width: 70px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-right: 10px;
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