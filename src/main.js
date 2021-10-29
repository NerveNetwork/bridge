import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import {post, request} from './api/https'
import { toThousands, isBeta } from "./api/util";
import { getChainConfig, getCrossAddress } from '@/api/getDefaultConfig'
import { hackAddChain } from '@/api/hackAddChain'
// import NotSupport from "@/components/NotSupport";
// import checkLocation from "@/api/checkLocation";
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

async function getConfigBeforeRender() {
  // 获取config
  const config = await getChainConfig();
  sessionStorage.setItem('config', JSON.stringify(config));
  new Vue({
    el: "#app",
    router,
    store,
    i18n,
    render: h => h(App)
  });
  // 获取nerve地址
  await getCrossAddress();
  // 新添加链后同步更新本地地址
  hackAddChain(config);
}

setTimeout(() => {
  getConfigBeforeRender();
}, 500)

/*async function getConfig(network) {
  try {
    const res = await request({url: "/api/chain/config", method: "get", network});
    let config = {};
    if (res.data && res.data.length) {
      res.data.map(v => {
        const mainInfo = v.mainAsset;
        config[v.chain] = {
          chainId: mainInfo ? mainInfo.chainId : "",
          assetId: mainInfo ? mainInfo.assetId : "",
          prefix: v.prefix,
          symbol: mainInfo ? mainInfo.symbol : "",
          decimal: mainInfo ? mainInfo.decimals : "",
          assets: v.assets,
          config: v.configs
        }
      });
    }
    sessionStorage.setItem("config", JSON.stringify(config));
  } catch (e) {
    console.error(e, "获取链配置失败");
  }
  /!* eslint-disable no-new *!/
  new Vue({
    el: "#app",
    router,
    store,
    i18n,
    render: h => h(App)
  });
}

getConfig(network);*/

/*async function checkLocationBeforeLoad() {
  const isMainland = await checkLocation();
  if (!isMainland) {
    getConfig(network);
    // 获取crossAddressMap
    request({url: "/api/common/config", method: "get"}).then(res => {
      if (res.code === 1000 && res.data) {
        localStorage.setItem("crossAddressMap", JSON.stringify(res.data))
      }
    }).catch(e => console.log("获取crossAddressMap失败" + e))
  } else {
    new Vue({
      el: "#app",
      render: h => h(NotSupport)
    });
  }
}

checkLocationBeforeLoad();*/
