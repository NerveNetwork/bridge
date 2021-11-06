import { request } from '@/api/https'
import { isBeta } from '@/api/util'
import defaultConfig from './defaultChainConfig'

const network = isBeta ? 'beta' : 'main';

export { defaultConfig };

export function setChainConfig(config) {
  const result = {}
  config.map(v => {
    const mainInfo = v.mainAsset;
    result[v.chain] = {
      chainId: mainInfo ? mainInfo.chainId : '',
      assetId: mainInfo ? mainInfo.assetId : '',
      prefix: v.prefix,
      symbol: mainInfo ? mainInfo.symbol : '',
      decimal: mainInfo ? mainInfo.decimals : '',
      assets: v.assets,
      config: v.configs
    }
  });
  sessionStorage.setItem("config", JSON.stringify(result))
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
      localStorage.setItem('crossAddressMap', JSON.stringify(res.data))
    }
  } catch (e) {
    console.error('获取crossAddressMap失败' + e);
    localStorage.removeItem('crossAddressMap');
  }
}