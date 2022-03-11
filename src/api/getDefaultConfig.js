import { request } from '@/api/https'
import { isBeta } from '@/api/util'
import defaultConfig from './defaultChainConfig'

const network = isBeta ? 'beta' : 'main';

export { defaultConfig };

export function setChainConfig(config) {
  const result = {};
  const sortedConfig = [...config].sort((a, b) => {
    return a.sort > b.sort ? 1 : -1
  })
  sortedConfig.map(v => {
    if (v.bridge !== 0) {
      const mainInfo = v.mainAsset;
      result[v.chain] = {
        chain: v.chain,
        chainId: mainInfo ? mainInfo.chainId : '',
        assetId: mainInfo ? mainInfo.assetId : '',
        prefix: v.prefix,
        symbol: mainInfo ? mainInfo.symbol : '',
        decimal: mainInfo ? mainInfo.decimals : '',
        assets: v.assets || [],
        config: v.configs,
        apiUrl: v.apiUrl,
        icon: v.icon,
        nativeId: '0x' + v.nativeId.toString(16),
        scan: v.scanUrl
      }
    }
  });
  // sessionStorage.setItem("config", JSON.stringify(result))
  localStorage.setItem("config", JSON.stringify(result))
  return result;
}

// 链配置
export async function getChainConfig() {
  let config = defaultConfig
  try {
    const res = await request({url: '/api/chain/config', method: 'get', network});
    if (res.data && res.data.length) {
      config = res.data
    }
  } catch (e) {
    console.error(e, '获取链配置失败, 使用本地config');
  }
  return config;
}

// 跨链nerve地址
export async function getCrossAddress() {
  try {
    const res = await request({url: '/api/common/config', method: 'get'})
    if (res.code === 1000) {
      return res.data;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}