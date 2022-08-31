import Vue from 'vue'
import Vuex from 'vuex'
import { request } from '@/api/https';
import { getChainConfigs } from '@/api/util'

Vue.use(Vuex);

Vue.config.devtools = process.env.NODE_ENV === 'development';

export default new Vuex.Store({
  state: {
    address: '',
    network: sessionStorage.getItem("network"),
    isWrongChain: false,
    config: getChainConfigs(),
    unConfirmedTx: JSON.parse(localStorage.getItem('unConfirmedTx')) || []
  },
  getters: {

  },
  mutations: {
    changeAddress(state, data) {
      state.address = data;
    },
    changeNetwork(state, data) {
      state.network = data;
      if (data) {
        sessionStorage.setItem("network", data);
      } else {
        sessionStorage.removeItem('network')
      }

    },
    changeIsWrongChain(state, isWrongChain) {
      state.isWrongChain = isWrongChain
    },
    changeConfig(state, config) {
      state.config = config
    },
    // 添加/移除记录的未确认交易
    changeUnConfirmedTx(state, tx) {
      const { hash, orderId } = tx;
      const txs = JSON.parse(localStorage.getItem('unConfirmedTx')) || [];
      const index = txs.findIndex(v => v.hash === hash);
      if (index === -1) {
        txs.push({ hash, orderId });
      } else {
        txs.splice(index, 1);
      }
      state.unConfirmedHash = txs;
      localStorage.setItem('unConfirmedTx', JSON.stringify(txs));
    }
  },

  actions: {
    async changeUnConfirmedTx({ commit, dispatch }, tx) {
      const { hash, orderId } = tx;
      const data = { txHash: hash, orderId }
      try {
        const res = await request({
          url: '/bridge/tx/hash/update',
          data
        })
        if (res.code === 1005 || res.code === 1000) {
          // 交易已存在 或者交易更新成功
          commit('changeUnConfirmedTx', tx);
        } else {
          dispatch('changeUnConfirmedTx', tx);
        }
      } catch (e) {
        if (e && e.response && e.response.status !== 200) {
          setTimeout(() => {
            dispatch('changeUnConfirmedTx', tx);
          }, 2000)
        }
      }
    }
  }
})
