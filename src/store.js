import Vue from 'vue'
import Vuex from 'vuex'
import { getChainConfigs } from '@/api/util'

Vue.use(Vuex);

Vue.config.devtools = process.env.NODE_ENV === 'development';

export default new Vuex.Store({
  state: {
    address: '',
    network: sessionStorage.getItem("network") || "NERVE",
    walletType: localStorage.getItem('walletType'),
    chainId: '',
    isWrongChain: false,
    config: getChainConfigs()
  },
  getters: {

  },
  mutations: {
    changeAddress(state, data) {
      state.address = data;
    },
    changeNetwork(state, data) {
      state.network = data;
      sessionStorage.setItem("network", data);
    },
    changeWalletType(state, type) {
      state.walletType = type;
      localStorage.setItem('walletType', type);
    },
    changeChainId(state, chainId) {
      state.chainId = chainId;
    },
    changeIsWrongChain(state, isWrongChain) {
      state.isWrongChain = isWrongChain
    },
    changeConfig(state, config) {
      state.config = config
    }
  },

  actions: {

  }
})
