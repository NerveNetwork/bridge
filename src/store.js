import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

Vue.config.devtools = process.env.NODE_ENV === 'development';

export default new Vuex.Store({
  state: {
    address: '',
    network: sessionStorage.getItem("network") || "NERVE",
    walletType: sessionStorage.getItem('walletType'),
    chainId: ''
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
      sessionStorage.setItem('walletType', type);
    },
    changeChainId(state, chainId) {
      state.chainId = chainId;
    }
  },

  actions: {

  }
})
