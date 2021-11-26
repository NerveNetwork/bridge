<template>
  <div class="home">
    <div class="home-content" v-loading="loading">
      <div class="support-list" v-if="!address">
        <span class="title">
          Connect wallet
        </span>
        <div class="providers-wrap">
          <p v-for="item in providerList" :key="item.name" @click="connectProvider(item.provider)">
            <img :src="item.src" alt="">
            {{item.name}}
          </p>
        </div>
      </div>
      <div class="show-sign-button" v-else-if="showSign">
        <el-button type="primary" @click="derivedAddress">{{
          $t("home.home1")
        }}</el-button>
      </div>
      <div v-else>
<!--        <tab-switch v-model="swapType"></tab-switch>-->
        <nerve-swap
          v-show="swapType==='nerve'"
          :address="address"
          :fromNetwork="fromNetwork"
          :fromChainId="fromChainId"
          :fromAddress="fromAddress"
          :fromChainError="fromChainError"
        ></nerve-swap>
<!--        <swft-swap
          v-show="swapType==='swft'"
          :address="address"
          :fromNetwork="fromNetwork"
          :fromChainId="fromChainId"
          :fromAddress="fromAddress"
          :fromChainError="fromChainError"
        >
        </swft-swap>-->
      </div>
    </div>
  </div>
</template>

<script>
// import TabSwitch from "@/components/TabSwitch";
import NerveSwap from "./NerveSwap";
// import SwftSwap from "./SwftSwap";
import { MAIN_INFO, NULS_INFO, ETHNET } from "@/config";
import nerve from "nerve-sdk-js";
import { supportChainList, getCurrentAccount } from "../../api/util";
import MetaMask from "../../assets/img/metamask.svg";
import Nabox from "../../assets/img/nabox.svg";
import TrustWallet from "../../assets/img/trustwallet.svg"
import Tokenpocket from "../../assets/img/Tokenpocket.svg"
import Mathwallet from "../../assets/img/mathwallet.svg"
import binancechain from "../../assets/img/binancechain.svg"
import OKEx from "../../assets/img/okexchain.png";
import safepal from "../../assets/img/safepal.svg";
import coin98 from "../../assets/img/coin98.svg";


const ethers = require("ethers");


const isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent);
const MetaMaskProvider = "ethereum"
const NaboxProvider = "NaboxWallet"
const OKExProvider = "okexchain"
const BSCProvider = "BinanceChain"
// const Coin98Provider = "coin98"

export default {
  data() {
    this.providerList = [
      { name: "MetaMask", src: MetaMask, provider: MetaMaskProvider },
      { name: "Nabox", src: Nabox, provider: NaboxProvider },
      { name: "Trust Wallet", src: TrustWallet, provider: MetaMaskProvider },
      { name: "TokenPocket", src: Tokenpocket, provider: MetaMaskProvider },
      { name: "MathWallet", src: Mathwallet, provider: MetaMaskProvider },
      { name: "Binance Chain", src: binancechain, provider: BSCProvider },
      { name: "OKEx Wallet", src: OKEx, provider: OKExProvider },
      { name: "SafePal", src: safepal, provider: MetaMaskProvider },
      { name: "Coin98", src: coin98, provider: MetaMaskProvider },
    ]
    return {
      loading: false,
      showSign: true, //显示派生地址
      swapType: "nerve",
      provider: null,
    };
  },

  components: {
    NerveSwap,
    // SwftSwap,
    // TabSwitch
  },

  computed: {
    //metamask当前选中地址
    address() {
      // console.log(this.$store.state.address, 10120012)
      return this.$store.state.address
    },
    fromChainId() {
      return this.$store.state.chainId
    },
    fromNetwork() {
      return this.$store.state.network;
    },
    fromAddress() {
      const currentAccount = getCurrentAccount(this.address);
      return currentAccount && !this.showSign ? currentAccount.address[this.fromNetwork] : "";
    },
    walletType() {
      return this.$store.state.walletType
    },
    fromChainError() {
      return this.$store.state.isWrongChain;
      /*if (!this.fromChainId) return true;
      if (this.fromNetwork === 'NULS' || this.fromNetwork === 'NERVE') return false;
      return !supportChainList.find(v => v[ETHNET] === this.fromChainId);*/
    }
  },

  watch: {
    address: {
      immediate: true,
      handler(val) {
        if (!val) return;
        const currentAccount = getCurrentAccount(val);
        const config = JSON.parse(sessionStorage.getItem("config"));
        const chainLength = Object.keys(config).length;
        const addressListLength = currentAccount ? Object.keys(currentAccount.address).length : 0
        // this.showSign = currentAccount ? false : true;
        this.showSign = !chainLength || chainLength !== addressListLength
      },
    }
  },

  created() {
    if (typeof this.$route.query.loginOut === 'boolean' && this.$route.query.loginOut === true) {
      // this.setConfig(null);
    }
  },

  methods: {
    // 连接provider
    async connectProvider(provider) {
      if (!window[provider]) {
        this.$message({ message: "No provider was found", type: "warning"});
        return
      }
      this.$store.commit('changeWalletType', provider);
    },
    //通过调用metamask签名，派生多链地址
    async derivedAddress() {
      this.loading = true;
      try {
        let account = {address: {}}, pub;
        if (!this.address.startsWith("0x")) {
         
          if (!window.nabox) {
            throw "Nabox not found"
          }
          pub = await window.nabox.getPub({
            address: this.address
          })
          const address = ethers.utils.computeAddress(ethers.utils.hexZeroPad(ethers.utils.hexStripZeros('0x' + pub), 33));
          account.address = this.getHeterogeneousAddress(address);
        } else {
          const walletType = localStorage.getItem('walletType')
          const provider = new ethers.providers.Web3Provider(window[walletType]);
          const jsonRpcSigner = provider.getSigner();
          let message = "Derive Multi-chain Address";
          const signature = await jsonRpcSigner.signMessage(message);
          const msgHash = ethers.utils.hashMessage(message);
          const msgHashBytes = ethers.utils.arrayify(msgHash);
          const recoveredPubKey = ethers.utils.recoverPublicKey(
            msgHashBytes,
            signature
          );
          account.address = this.getHeterogeneousAddress(this.address);
          if (recoveredPubKey.startsWith("0x04")) {
            const compressPub = ethers.utils.computePublicKey(
              recoveredPubKey,
              true
            );
            pub = compressPub.slice(2);
          } else {
            throw "sign error"
          }
        }

        account.pub = pub;
        const { chainId, assetId, prefix } = MAIN_INFO;
        const {
          chainId: NULSChainId,
          assetId: NULSAssetId,
          prefix: NULSPrefix,
        } = NULS_INFO;
        // console.log(NULSChainId, NULSAssetId, NULSPrefix, 55)
        account.address.NERVE = nerve.getAddressByPub(
          chainId,
          assetId,
          pub,
          prefix
        );
        account.address.NULS = nerve.getAddressByPub(
          NULSChainId,
          NULSAssetId,
          pub,
          NULSPrefix
        );

        const accountList = JSON.parse(localStorage.getItem("accountList")) || [];
        const existIndex = accountList.findIndex(v => v.pub === account.pub);
        // 原来存在就替换，找不到就push
        if (existIndex > -1) {
          accountList[existIndex] = account
        } else {
          accountList.push(account);
        }
        const syncRes = await this.syncAccount(pub, account.address);
        if (syncRes) {
          localStorage.setItem("accountList", JSON.stringify(accountList));
          window.location.reload();
        } else {
          this.$message({
            type: "warning",
            message: this.$t("tips.tips4"),
          });
        }
      } catch (e) {
        console.log(e, 556)
        this.$message({ message: this.$t("tips.tips5"), type: "warning" });
      }
      this.loading = false;
      // this.showSign = false;
    },
    getHeterogeneousAddress(address) {
      const chainAddress = {}
      const chainConfig = JSON.parse(sessionStorage.getItem('config'));
      for(let chain in chainConfig) {
        if (chain !== 'NULS' && chain !== 'NERVE') {
          chainAddress[chain] = address
        }
      }
      return chainAddress
    },
    async syncAccount(pub, accounts) {
      const addressList = [];
      Object.keys(accounts).map((v) => {
        addressList.push({
          chain: v,
          address: accounts[v],
        });
      });
      const res = await this.$request({
        url: "/wallet/sync",
        data: { pubKey: pub, addressList },
      });
      return res.code === 1000;
    },
  },
};
</script>
<style lang="less">
@BColor: #ebeef8;
@labelColor: #99a3c4;
.home {
  padding: 20px;
  height: calc(~'100% - 64px');
  .home-content {
    width: 100%;
    height: 100%;
    /*background-color: #fff;
    margin: 0 15px 15px;
    padding: 25px 15px;
    min-height: calc(100% - 15px);
    border-radius: 6px;*/
  }
  .support-list {
    //width: 96%;
    margin: 0 auto;
    .title {
      font-size: 20px;
      font-weight: 600;
      line-height: 2;
      margin-bottom: 5px;
      display: inline-block;
      margin-top: -10px;
    }
    .providers-wrap {
      display: flex;
      flex-wrap: wrap;
    }
    p {
      width: 50%;
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 15px;
      margin-bottom: 15px;
      border-radius: 16px;
      cursor: pointer;
      color: #a1a4b1;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid transparent;
      &:hover {
        border-color: #5bcaf9;
        color: #333;
      }
      img {
        width: 28px;
        height: 28px;
        margin-right: 10px;
      }
      @media screen and (max-width: 400px){
        font-size: 12px;
        padding: 0 8px;
        img {
          width: 22px;
          height: 22px;
        }
      }
    }
  }
  .show-sign-button {
    text-align: center;
    padding-top: 50px;
    .el-button {
      // padding: 12px 50px;
      border-radius: 10px;
      padding: 16px 50px;
    }
  }
}
</style>
