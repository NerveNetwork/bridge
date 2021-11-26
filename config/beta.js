
//开发模式
export const IS_DEV = process.env.NODE_ENV === 'development';

//燃烧地址的公钥
export const API_BURNING_ADDRESS_PUB = 'TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY';

//chainId、assetId、prefix
export const MAIN_INFO = { chainId: 5, assetId: 1, prefix: 'TNVT',symbol:"NVT", decimal: 8, rpc: "http://beta.public.nerve.network" };
export const NULS_INFO = { chainId: 2, assetId: 1, prefix: 'tNULS',symbol:"NULS", decimal: 8, rpc: "http://beta.public1.nuls.io" };

//ETH 网络信息 测试网:ropsten, 主网:homestead
export const ETHNET = 'ropsten';

// export const BRIDGE_API_URL = IS_DEV ? "/bridge-api" : "http://beta.bridge.nerve.network/bridge-api";
export const BRIDGE_API_URL = "http://beta.api.bridge.nerve.network";



/*export const IS_DEV = process.env.NODE_ENV === 'development';

//燃烧地址的公钥
export const API_BURNING_ADDRESS_PUB = 'NERVEepb63T1M8JgQ26jwZpZXYL8ZMLdUAK31L';

//ChainId和资产ID
export const MAIN_INFO = { chainId: 9, assetId: 1, prefix: 'NERVE', symbol: "NVT", decimal: 8, rpc: "https://public.nerve.network" };
export const NULS_INFO = { chainId: 1, assetId: 1, prefix: 'NULS',symbol:"NULS", decimal: 8, rpc: "https://public1.nuls.io" };

//ETH 网络信息 测试网:ropsten, 主网:homestead
export const ETHNET = 'homestead';

// export const BRIDGE_API_URL = IS_DEV ? "/bridge-api" : "https://api.bridge.nerve.network";
export const BRIDGE_API_URL = "https://api.bridge.nerve.network";*/


