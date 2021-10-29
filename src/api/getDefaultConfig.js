import { request } from '@/api/https'
import { isBeta } from '@/api/util'
import defaultConfig from './defaultChainConfig'

const network = isBeta ? 'beta' : 'main';

function handleChainConfig(config) {
  let res = {}
  config.map(v => {
    const mainInfo = v.mainAsset;
    res[v.chain] = {
      chainId: mainInfo ? mainInfo.chainId : '',
      assetId: mainInfo ? mainInfo.assetId : '',
      prefix: v.prefix,
      symbol: mainInfo ? mainInfo.symbol : '',
      decimal: mainInfo ? mainInfo.decimals : '',
      assets: v.assets,
      config: v.configs
    }
  });
  return res;
}

// 链配置
export async function getChainConfig() {
  let config = {}
  try {
    const res = await request({url: '/api/chain/config', method: 'get', network});
    if (res.data && res.data.length) {
      config = handleChainConfig(res.data);
    }
  } catch (e) {
    console.error(e, '获取链配置失败, 使用本地config');
    config = handleChainConfig(defaultConfig)
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