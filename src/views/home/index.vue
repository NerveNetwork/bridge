<template>
  <div class="home">
    <div class="home-content" v-loading="loading">
      <div class="support-list" v-if="!address">
        <span class="title">
          Connect Wallet
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
        <nerve-swap
          v-show="swapType==='nerve'"
          :address="address"
          :fromNetwork="fromNetwork"
          :fromAddress="fromAddress"
        ></nerve-swap>
      </div>
    </div>
  </div>
</template>

<script>
import NerveSwap from "./NerveSwap";
import { getCurrentAccount, getChainConfigs } from "@/api/util";
import { getAddress } from '@/api/accountUtils';
import { ETransfer } from '@/api/api';
const ethers = require("ethers");
import TronLinkApi from '@/api/tronApi';


import MetaMask from "@/assets/img/provider/metamask.svg";
import Nabox from "@/assets/img/provider/nabox.svg";
import TrustWallet from "@/assets/img/provider/trustwallet.svg"
import Tokenpocket from "@/assets/img/provider/Tokenpocket.svg"
import Mathwallet from "@/assets/img/provider/mathwallet.svg"
import binancechain from "@/assets/img/provider/binancechain.svg"
import OKEx from "@/assets/img/provider/metax.jpg";
import safepal from "@/assets/img/provider/safepal.svg";
import coin98 from "@/assets/img/provider/coin98.svg";
import bitkeep from '@/assets/img/provider/bitkeep.jpg';
import tronLink from '@/assets/img/provider/tronLink.jpg';





const isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent);
const MetaMaskProvider = "ethereum";
const NaboxProvider = "NaboxWallet";
const OKExProvider = "okexchain";
const BSCProvider = "BinanceChain";
const TronProvider = 'tronWeb';
// const Coin98Provider = "coin98"

export default {
  data() {
    this.providerList = [
      { name: "MetaMask", src: MetaMask, provider: MetaMaskProvider },
      { name: "Nabox", src: Nabox, provider: NaboxProvider },
      { name: "Trust Wallet", src: TrustWallet, provider: MetaMaskProvider },
      { name: "TokenPocket", src: Tokenpocket, provider: MetaMaskProvider },
      { name: "MathWallet", src: Mathwallet, provider: MetaMaskProvider },
      { name: "Binance Wallet", src: binancechain, provider: BSCProvider },
      { name: "MetaX", src: OKEx, provider: OKExProvider },
      { name: "SafePal", src: safepal, provider: MetaMaskProvider },
      { name: "Coin98", src: coin98, provider: MetaMaskProvider },
      { name: "BitKeep", src: bitkeep, provider: MetaMaskProvider },
      { name: "TronLink", src: tronLink, provider: TronProvider },
    ]
    return {
      loading: false,
      swapType: "nerve",
      provider: null,
    };
  },

  components: {
    NerveSwap
  },

  computed: {
    //metamask当前选中地址
    address() {
      // console.log(this.$store.state.address, 10120012)
      return this.$store.state.address
    },
    fromNetwork() {
      return this.$store.state.network;
    },
    fromAddress() {
      const currentAccount = getCurrentAccount(this.address);
      return currentAccount && !this.showSign ? currentAccount.address[this.fromNetwork] : "";
    },
    //是否显示派生地址
    showSign() {
      if (this.address) {
        const currentAccount = getCurrentAccount(this.address);
        const config = this.$store.state.config;
        const chainLength = Object.keys(config).length;
        const addressListLength = currentAccount ? Object.keys(currentAccount.address).length : 0
        return !chainLength || chainLength !== addressListLength
      }
      return true;
    }
  },

  methods: {
    // 连接provider
    async connectProvider(walletType) {
      const provider = window[walletType]
      if (!provider) {
        this.$message({ message: "No provider was found", type: "warning"});
        return
      }
      try {
        if (walletType === 'tronWeb') {
          // await window.tronLink.request({method: 'tron_requestAccounts'})
          const res = await window.tronLink.request({
            method: 'tron_requestAccounts'
          });
          if (res.code === 200) {
            sessionStorage.removeItem("network");
            localStorage.setItem('walletType', walletType);
            window.location.reload();
          } else {
            this.$message.error(res.message);
          }
          // console.log(res, 888);
        } else {
          await provider.request({ method: "eth_requestAccounts" });
          localStorage.setItem('walletType', walletType);
          window.location.reload();
        }
      } catch (e) {
        this.$message.error(e.message || e);
      }
    },
    //通过调用metamask签名，派生多链地址
    async derivedAddress() {
      this.loading = true;
      console.log(this.address, 66);
      const walletType = localStorage.getItem('walletType')
      try {
        let account = { address: {}, pub: '' }, pub;
        if (walletType === 'tronWeb') {
          const transfer = new TronLinkApi();
          const message = "Derive Multi-chain Address";
          pub = await transfer.getPubBySign(message)
        } else {
          if (!this.address.startsWith("0x")) {
            if (!window.nabox) {
              throw "Nabox not found"
            }
            pub = await window.nabox.getPub({
              address: this.address
            })
          } else {
            const transfer = new ETransfer();
            const message = "Derive Multi-chain Address";
            pub = await transfer.getPubBySign(message)
          }
        }
        account.pub = pub;
        const chainConfig = getChainConfigs();
        account.address = getAddress(pub, chainConfig)

        const accountList = JSON.parse(localStorage.getItem("accountList")) || [];
        const existIndex = accountList.findIndex(v => v.pub === account.pub);
        // 原来存在就替换，找不到就push
        if (existIndex > -1) {
          accountList[existIndex] = account
        } else {
          accountList.push(account);
        }
        const syncRes = await this.syncAccount(pub);
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
    },
    async syncAccount(pub) {
      const res = await this.$request({
        url: "/wallet/sync",
        data: { pubKey: pub },
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
