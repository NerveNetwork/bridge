<template>
  <div class="header">
    <div class="left clicks" @click="$router.replace('/');showMenu=false">
      <img src="../assets/img/nervelogo.svg" alt="">
      <!-- NerveBridge -->
    </div>
    <div class="right" v-if="showAccountArea">
      <div class="address">
        <template v-if="isWrongChain">
          <div @click="showNetworkList=!showNetworkList" class="wrong-chain">{{ $t("home.home28") }}</div></template>
        <template v-else>
          <div class="network" @click="showSwitchChain">
            <img :src="chainLogo" alt="">
            <i class="el-icon-caret-bottom" style="margin-left: -5px"></i>
          </div>
          <span @click="showAccountManage">{{ superLong(address, 5) }}</span>
        </template>
        <ChainList v-model="showNetworkList" :currentChain="currentChain" @change="switchChain"></ChainList>
      </div>
      <img class="click" src="../assets/img/icon-menu.svg" alt="" @click="toggleMenu">
    </div>
    <el-dialog
      title="账户"
      :visible.sync="showAccountDialog"
      :modal-append-to-body="false"
      class="account-dialog"
      width="80%">
      <div class="header_content tc">
        <div class="address">
          {{superLong(address, 6)}}
          <i class="iconfont icon-lianjie" @click="openUrl"></i>
          <i class="iconfont icon-fuzhi1" @click="copy(address)"></i>
        </div>
        <el-button @click="quit">{{ $t("header.header8") }}</el-button>
      </div>
    </el-dialog>
    <NavMenu v-model="showMenu"></NavMenu>

    <el-dialog
      :title="$t('header.header13')"
      :visible.sync="showSwitchChainTip"
      :modal-append-to-body="false"
      class="switch-tip-dialog"
      width="80%"
    >
      <div>
        <p class="tips">{{ $t('header.header10') }}</p>
        <div class="btns tc">
          <el-button @click="showSwitchChainTip=false">{{ $t('header.header11') }}</el-button>
          <el-button type="primary" @click="reSelectProvider">{{ $t('header.header12') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import ChainList from '@/components/ChainList';
  import NavMenu from '@/components/NavMenu';
  import { superLong, copys, getChainConfigs, openScan } from '@/api/util'
  import { isBeta, getCurrentAccount } from '@/api/util';

  export default {
    data() {
      this.isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
      this.configs = getChainConfigs();
      return {
        showNetworkList: false,
        showAccountDialog: false,
        showSwitchChainTip: false,
        showMenu: false,
        walletAddress: isBeta ? "http://beta.wallet.nerve.network" : "https://wallet.nerve.network",
      };
    },
    components: {
      ChainList,
      NavMenu
    },
    computed: {
      address() {
        return this.$store.state.address
      },
      currentChain() {
        return this.$store.state.network
      },
      isWrongChain() {
        return this.$store.state.isWrongChain
      },
      showAccountArea() {
        const currentAccount = getCurrentAccount(this.address)
        return !!currentAccount
      },
      chainLogo() {
        const config = this.configs;
        const chain = config[this.currentChain]
        return chain ? chain.icon : ''
      }
    },
    /*watch: {
      '$store.state.network': {
        handler(val) {
          if (val === "NULS" || val === "NERVE") {
            this.$store.commit("changeIsWrongChain", false)
          }
        }
      }
    },*/
    mounted() {
      this.providerType = localStorage.getItem("walletType");
      this.walletProvider = window[this.providerType] || null;
      this.initConnect();
    },
    methods: {
      async initConnect() {
        this.configs = getChainConfigs();
        const provider = this.walletProvider;
        if (!provider) return;
        let address;
        if (this.providerType === 'tronWeb') {
          address = provider.defaultAddress.base58;
        } else {
          address = provider.selectedAddress || provider.address;
        }
        if (!address) {
          // await this.requestAccounts();
          // this.quit();
        } else {
          this.initChainInfo(address);
          this.addListener();
        }
      },
      /*getProvider() {
        const providerType = localStorage.getItem("walletType");
        return window[providerType] || null;
      },*/
      async requestAccounts() {
        const res = await this.walletProvider.request({ method: "eth_requestAccounts" });
        if (res.length) {
          this.initChainInfo(res[0]);
        }
      },
      // 监听账户、网络变化
      addListener() {
        if (this.providerType === 'tronWeb') {
          this.addTronListener();
        } else {
          this.listenAccountChange();
          this.listenNetworkChange();
        }
      },
      addTronListener() {
        // 监听tronLink事件
        window.addEventListener('message', e => {
          if (!e.data.message) return;
          // 账户改变
          if (e.data.message.action === 'accountsChanged') {
            this.reload();
          }
          // 断开连接
          if (e.data.message.action === 'disconnect') {
            // console.log("disconnect event", e.data.message)
            this.quit();
          }
          // 网络切换
          if (e.data.message.action === 'setNode') {
            // console.log("setNode", e.data)
            this.reload();
          }
        })
      },
      //EVM 监听账户改变
      listenAccountChange() {
        this.walletProvider.on("accountsChanged", (accounts) => {
          console.log(accounts, "===accounts-changed===")
          if (accounts.length) {
            this.reload();
          } else {
            this.quit();
          }
        });
      },

      //EVM 监听网络改变
      listenNetworkChange() {
        this.walletProvider.on("chainChanged", (chainId) => {
          console.log(chainId, "===chainId-changed===")
          if (chainId) {
            const chainInfo = Object.values(this.configs).find(v => v.nativeId === chainId);
            const network = chainInfo && chainInfo.chain || null;
            this.$store.commit("changeNetwork", network);
            this.reload();
          }
        });
      },

      // 初始化当前网络、chainId， address信息
      initChainInfo(address) {
        const currentAccount = getCurrentAccount(address);
        // console.log(currentAccount, 88, address);
        let chainId = this.walletProvider.chainId + '';
        chainId = chainId.startsWith("0x") ? chainId : "0x" + Number(chainId).toString(16);
        const chainInfo = Object.values(this.configs).find(v => v.nativeId === chainId);
        const isTronAddress = this.walletProvider.isAddress && this.walletProvider.isAddress(address);
        let isWrongChain = isTronAddress ? false : !chainInfo;
        let currentAddress = address;
        let network = sessionStorage.getItem("network");
        if (network && network !== 'undefined') {
          if (network === 'NULS' || network === 'NERVE') {
            // isWrongChain = !currentAccount;
            // 新账户、且bridge之前在NULS链，会导致currentAccount为null
            // currentAddress = currentAccount ? currentAccount.address[network] : address;
          }
          if (network === 'TRON') {
            isWrongChain = this.checkTronNetwork();
          }
        } else {
          if (isTronAddress) {
            network = 'TRON';
            isWrongChain = this.checkTronNetwork();
          } else {
            network = chainInfo && chainInfo.chain;
          }
          // network = isTronAddress ? 'TRON' : chainInfo && chainInfo.chain;
        }
        this.$store.commit("changeIsWrongChain", isWrongChain);
        this.$store.commit("changeAddress", currentAddress);
        this.$store.commit("changeNetwork", network);
      },

      checkTronNetwork() {
        let isWrongChain = false;
        const apiPrefix = isBeta ? 'shasta' : 'trongrid';
        const apiUrl = this.walletProvider.fullNode.host;
        if (apiUrl.indexOf(apiPrefix) < 0) {
          isWrongChain = true;
        }
        return isWrongChain;
      },

      superLong(str, len = 8) {
        return superLong(str, len)
      },
      showSwitchChain() {
        this.showNetworkList = !this.showNetworkList;
        this.showMenu = false;
      },
      showAccountManage() {
        this.showAccountDialog = true;
        this.showMenu = false;
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
      openUrl() {
        openScan(this.currentChain, 'address', this.address)
        this.showAccountDialog = false
      },
      copy(str) {
        copys(str)
        this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
        this.showAccountDialog = false
      },
      quit() {
        this.showAccountDialog = false;
        this.$store.commit('changeNetwork', '')
        localStorage.removeItem('walletType');
        this.$router.push("/");
        this.reload();
      },
      openLink(url) {
        window.open(url)
      },
      async switchChain(item) {
        const chain = item.chain;
        if (this.currentChain === chain) return;
        console.log(this.currentChain, chain, '----00-----');
        if (this.currentChain === 'TRON' || this.walletProvider === 'tronWeb' || item.chain === 'TRON') {
          this.showSwitchChainTip = true;
          return;
        }
        const provider = this.walletProvider;
        if (chain === "NULS" || chain === "NERVE" || item.nativeId === provider.chainId) {
          this.$store.commit('changeNetwork', chain)
          const currentAccount = getCurrentAccount(this.address);
          const newAddress = currentAccount.address[chain];
          this.$store.commit('changeAddress', newAddress);
          this.$store.commit('changeIsWrongChain', false);
          return;
        }
        try {
          if (chain !== "Ethereum") {
            const chainName = isBeta ? chain + '_Beta' : chain;
            const addItem = {
              chainId: item.nativeId,
              rpcUrls: item.apiUrl ? [item.apiUrl] : [],
              chainName,
              nativeCurrency: {
                name: chain,
                symbol: item.symbol,
                decimals: item.decimal,
              },
              blockExplorerUrls: [item.scan]
            }
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [addItem]
            });
          } else {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: item.nativeId }]
            });
          }
          // this.reload();
          // if (this.isMobile) {
          //   this.reload()
          // }
        } catch (e) {
          console.log(e, 89898)
        }
      },
      reload() {
        window.location.reload()
      },
      reSelectProvider() {
        this.showSwitchChainTip = false;
        this.quit();
      }
    },
  }
</script>

<style lang="less" scoped>
  @import "./../assets/css/style";
  .header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    border-bottom: 1px solid #CED3E5;
    background-color: #fff;
    .left img {
      width: 96px;
      @media screen and (max-width: 400px){
        width: 75px;
      }
    }
    .left, .right {
      display: flex;
      align-items: center;
    }

    .right {
      .address {
        min-width: 170px;
        height: 32px;
        line-height: 32px;
        padding: 0 10px;
        background-color: #EBEEF8;
        color: #99A3C4;
        font-size: 14px;
        border-radius: 18px;
        text-align: center;
        margin-right: 20px;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        @media screen and (max-width: 400px){
          margin-right: 15px;
          padding: 0 8px;
        }
        .wrong-chain {
          width: 100%;
          color: #B8741A;
          font-weight: 600;
          /*&:hover {
            opacity: 0.65;
          }*/
        }
        .network {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 2px 0;
          margin-right: 5px;
          img {
            width: 25px;
            margin-right: 8px;
            border-radius: 50%;
          }
        }
        .support-network-list {
          position: absolute;
          top: 30px;
          left: 20px;
          z-index: 99999;
          width: 150px;
          padding: 6px 0;
          margin-top: 8px;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          background-color: #fff;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          li {
            padding: 5px 15px;
            p {
              display: flex;
              align-items: center;
              img {
                width: 28px;
                margin-right: 10px;
              }
              &:hover {
                background-color: #f5f7fa;
              }
              &.active {
                color: #409eff;
                font-weight: 700;
              }
            }
          }
          .pop-arrow, .pop-arrow:after {
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-width: 6px;
            border-top-width: 0;
            border-color: transparent;
            border-style: solid;
          }
          .pop-arrow {
            top: -6px;
            left: 30px;
            border-bottom-color: #EBEEF5;
            &:after {
              content: " ";
              top: 1px;
              margin-left: -6px;
              border-bottom-color: #FFF;
            }
          }
        }
      }
      .icon-menu {
        cursor: pointer;
        font-size: 24px;
        color: #515B7D;
      }
    }
    .account-dialog {

      .address {
        color: #5BCAF9;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        .iconfont {
          margin-left: 25px;
          font-size: 20px;
          color: #515B7D;
          cursor: pointer;
        }
      }
      .el-button {
        padding: 12px 30px;
        border-color: #5BCAF9;
        color: #5BCAF9;
        border-radius: 10px;
      }
    }
    .switch-tip-dialog {
      .tips {
        font-size: 15px;
        margin: -5px 0 20px;
      }
      .btns .el-button:first-child {
        margin-right: 20px;
      }
    }
  }
</style>
