import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import {post, request} from './api/https'
import { toThousands, isBeta, getChainConfigs } from "./api/util";
import { getChainConfig, setChainConfig, defaultConfig } from '@/api/getDefaultConfig'
import { hackAddChain } from '@/api/hackAddChain'
// import './api/rem'
// import VConsole from 'vconsole'
// new VConsole()

const development = process.env.NODE_ENV === "development"

Vue.config.devtools = development;

if (!development) {
  console.log = () => {};
}

Vue.config.productionTip = false;

Vue.filter('toThousands', toThousands)

Vue.prototype.$post = post;

Vue.prototype.$request = request;


if (development && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = App.constructor
}

async function setConfig() {
  // 设置默认config
  const sessionConfig = getChainConfigs();
  if (!sessionConfig) {
    setChainConfig(defaultConfig);
    store.commit('changeConfig', defaultConfig);
  } else {
    store.commit('changeConfig', sessionConfig);
  }
  const apiConfig = await getChainConfig();
  // 接口返回的config
  const config = setChainConfig(apiConfig);
  store.commit('changeConfig', config);
  // 新添加链后同步更新本地地址
  hackAddChain(config);
}

setConfig()

setTimeout(() => {
  // 延迟加载，避免插件注入的js还没生效
  new Vue({
    el: "#app",
    router,
    store,
    i18n,
    render: h => h(App)
  });
}, 500)
