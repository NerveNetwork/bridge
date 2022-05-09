const beta = [
  {
    "id": 24,
    "chain": "Ethereum",
    "chainName": "Ethereum",
    "prefix": "0x",
    "nativeId": 3,
    "chainId": 101,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Ethereum.png",
    "apiUrl": "https://ropsten.infura.io/v3/7e086d9f3bdc48e4996a3997b33b032f",
    "scanUrl": "https://ropsten.etherscan.io/",
    "psUrl": "https://faucets.chain.link/rinkeby",
    "sort": 1,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0xb966f6Df75Ff460887d66DEb0b246886374C2Fa5",
      "crossAddress": "0x5e1cba794aD91FCd272fDaF2cd91b6110b601ED2",
      "nft": ""
    },
    "mainAsset": {
      "id": 17673,
      "chain": "Ethereum",
      "registerChain": "Ethereum",
      "chainId": 101,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "ETH",
      "symbol": "ETH",
      "symbolBase": "ETH",
      "configType": 1,
      "source": 9,
      "icon": "https://files.nabox.io/icon/ETH.png",
      "nulsCross": true,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 101,
          "heterogeneousChainMultySignAddress": "0x5e1cba794ad91fcd272fdaf2cd91b6110b601ed2",
          "contractAddress": "",
          "chainName": "Ethereum",
          "token": false
        },
        {
          "heterogeneousChainId": 102,
          "heterogeneousChainMultySignAddress": "0xf85f03c3faac61acf7b187513aef10041029a1b2",
          "contractAddress": "0x5673e9dd71072dc975bfb146c40760b0fcbe9039",
          "chainName": "BSC",
          "token": true
        },
        {
          "heterogeneousChainId": 103,
          "heterogeneousChainMultySignAddress": "0x19d90d3c8eb0c0b3e3093b054031ff1ca81704b8",
          "contractAddress": "0x56f175d48211e7d018dda7f0a0b51bcfb405ae69",
          "chainName": "Heco",
          "token": true
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 2,
      "nerveFlag": false,
      "usdPrice": 2519.8469,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 9,
        "chain": "Ethereum",
        "nativeId": 3,
        "name": "eth-1",
        "apiUrl": "https://ropsten.infura.io/v3/7e086d9f3bdc48e4996a3997b33b032f"
      }
    ]
  },
  {
    "id": 25,
    "chain": "BSC",
    "chainName": "BSC",
    "prefix": "0x",
    "nativeId": 97,
    "chainId": 102,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/BSC.png",
    "apiUrl": "https://data-seed-prebsc-1-s2.binance.org:8545/",
    "scanUrl": "https://testnet.bscscan.com/",
    "psUrl": "https://testnet.binance.org/faucet-smart",
    "sort": 2,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0x2e31a3FBE1796c1CeC99BD2F3E87c0f085d2afB1",
      "crossAddress": "0xf85f03C3fAAC61ACF7B187513aeF10041029A1b2",
      "nft": "bsc testnet"
    },
    "mainAsset": {
      "id": 19147,
      "chain": "BSC",
      "registerChain": "BSC",
      "chainId": 102,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "BNB",
      "symbol": "BNB",
      "symbolBase": "BNB",
      "configType": 1,
      "source": 9,
      "icon": "https://files.nabox.io/icon/BSC.png",
      "nulsCross": true,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 101,
          "heterogeneousChainMultySignAddress": "0x5e1cba794ad91fcd272fdaf2cd91b6110b601ed2",
          "contractAddress": "0x1ecb2473d2d34c4fa081708340bfcd045a697106",
          "chainName": "Ethereum",
          "token": true
        },
        {
          "heterogeneousChainId": 102,
          "heterogeneousChainMultySignAddress": "0xf85f03c3faac61acf7b187513aef10041029a1b2",
          "contractAddress": "",
          "chainName": "BSC",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 8,
      "nerveFlag": false,
      "usdPrice": 355.8369,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 3,
        "chain": "BSC",
        "nativeId": 97,
        "name": "bsc-1",
        "apiUrl": "https://data-seed-prebsc-1-s1.binance.org:8545/"
      },
      {
        "id": 13,
        "chain": "BSC",
        "nativeId": 97,
        "name": "bsc-2",
        "apiUrl": "https://data-seed-prebsc-1-s2.binance.org:8545/"
      },
      {
        "id": 25,
        "chain": "BSC",
        "nativeId": 97,
        "name": "bnb chain-1",
        "apiUrl": "https://data-seed-prebsc-1-s2.binance.org:8545/"
      }
    ]
  },
  {
    "id": 29,
    "chain": "Polygon",
    "chainName": "Polygon",
    "prefix": "0x",
    "nativeId": 80001,
    "chainId": 106,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Polygon.png",
    "apiUrl": "https://matic-mumbai.chainstacklabs.com",
    "scanUrl": "https://mumbai.polygonscan.com/",
    "psUrl": "https://faucet.polygon.technology/",
    "sort": 3,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0x4D3B8eFcC04cA63Be112Da5147C80c87aC969F5B",
      "crossAddress": "0xFe05820BaE725fD093E9C1CB6E40AB3BDc40Def2",
      "nft": ""
    },
    "mainAsset": {
      "id": 18894,
      "chain": "Polygon",
      "registerChain": "Polygon",
      "chainId": 106,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "MATIC",
      "symbol": "MATIC",
      "symbolBase": "MATIC",
      "configType": 1,
      "source": 4,
      "icon": "https://nuls-cf.oss-us-west-1.aliyuncs.com/icon/Polygon.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 106,
          "heterogeneousChainMultySignAddress": "0xfe05820bae725fd093e9c1cb6e40ab3bdc40def2",
          "contractAddress": "",
          "chainName": "Polygon",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 34,
      "nerveFlag": false,
      "usdPrice": 0.977,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 7,
        "chain": "Polygon",
        "nativeId": 80001,
        "name": "matic-1",
        "apiUrl": "https://matic-mumbai.chainstacklabs.com"
      }
    ]
  },
  {
    "id": 26,
    "chain": "Heco",
    "chainName": "Heco",
    "prefix": "0x",
    "nativeId": 256,
    "chainId": 103,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Heco.png",
    "apiUrl": "https://http-testnet.hecochain.com",
    "scanUrl": "https://testnet.hecoinfo.com/",
    "psUrl": "https://scan-testnet.hecochain.com/faucet",
    "sort": 4,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0x4564512f7216a617BC8C8B1E0b2893C7CB17927e",
      "crossAddress": "0x19d90D3C8eb0C0B3E3093B054031fF1cA81704B8",
      "nft": ""
    },
    "mainAsset": {
      "id": 17675,
      "chain": "Heco",
      "registerChain": "Heco",
      "chainId": 103,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "HT",
      "symbol": "HT",
      "symbolBase": "HT",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/HT.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 103,
          "heterogeneousChainMultySignAddress": "0x19d90d3c8eb0c0b3e3093b054031ff1ca81704b8",
          "contractAddress": "",
          "chainName": "Heco",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 9,
      "nerveFlag": false,
      "usdPrice": 8.2073,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 4,
        "chain": "Heco",
        "nativeId": 256,
        "name": "heco-1",
        "apiUrl": "https://http-testnet.hecochain.com"
      }
    ]
  },
  {
    "id": 27,
    "chain": "OKC",
    "chainName": "OKC",
    "prefix": "0x",
    "nativeId": 65,
    "chainId": 104,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/OKExChain.png",
    "apiUrl": "https://exchaintestrpc.okex.org",
    "scanUrl": "https://www.oklink.com/okexchain-test/",
    "psUrl": "https://discord.com/invite/B5nMs6qK5F",
    "sort": 5,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0x0111E01E78af5608e33569Edd997Fe2f700A0721",
      "crossAddress": "0xB490F2a3eC0B90e5faa1636bE046d82AB7cdAC74",
      "nft": ""
    },
    "mainAsset": {
      "id": 19120,
      "chain": "OKC",
      "registerChain": "OKC",
      "chainId": 104,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "OKT",
      "symbol": "OKT",
      "symbolBase": "OKT",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/OKExChain.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 104,
          "heterogeneousChainMultySignAddress": "0xb490f2a3ec0b90e5faa1636be046d82ab7cdac74",
          "contractAddress": "",
          "chainName": "OKC",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 12,
      "nerveFlag": false,
      "usdPrice": 34.35,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 5,
        "chain": "OKC",
        "nativeId": 65,
        "name": "oec-1",
        "apiUrl": "https://exchaintestrpc.okex.org"
      }
    ]
  },
  {
    "id": 32,
    "chain": "Avalanche",
    "chainName": "Avalanche",
    "prefix": "0x",
    "nativeId": 43113,
    "chainId": 110,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/AVAX.png",
    "apiUrl": "https://api.avax-test.network/ext/bc/C/rpc",
    "scanUrl": "https://testnet.snowtrace.io/",
    "psUrl": "https://faucet.avax-test.network/",
    "sort": 6,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0xC1f4F265EC8A46ad19740E7d3c6960db4c595dE5",
      "crossAddress": "0x8999d8738CC9B2E1fb1D01E1af732421D53Cb2A9",
      "nft": ""
    },
    "mainAsset": {
      "id": 19035,
      "chain": "Avalanche",
      "registerChain": "Avalanche",
      "chainId": 110,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "AVAX",
      "symbol": "AVAX",
      "symbolBase": "AVAX",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/AVAX.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 110,
          "heterogeneousChainMultySignAddress": "0x8999d8738cc9b2e1fb1d01e1af732421d53cb2a9",
          "contractAddress": "",
          "chainName": "Avalanche",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 94,
      "nerveFlag": false,
      "usdPrice": 51.6992,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 15,
        "chain": "Avalanche",
        "nativeId": 43113,
        "name": "avalanche-1",
        "apiUrl": "https://api.avax-test.network/ext/bc/C/rpc"
      }
    ]
  },
  {
    "id": 28,
    "chain": "Harmony",
    "chainName": "Harmony",
    "prefix": "0x",
    "nativeId": 1666700000,
    "chainId": 105,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Harmony.png",
    "apiUrl": "https://api.s0.pops.one/",
    "scanUrl": "https://beta.explorer.harmony.one/",
    "psUrl": "https://faucet.pops.one/",
    "sort": 7,
    "status": 1,
    "bridge": 1,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0x767188de0CE73c8771E72c4caF4a18De2303DF01",
      "crossAddress": "0x0EA7cE4180E8Bc484db4be9b497d9D106a3D7781",
      "nft": ""
    },
    "mainAsset": {
      "id": 18893,
      "chain": "Harmony",
      "registerChain": "Harmony",
      "chainId": 105,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "ONE",
      "symbol": "ONE",
      "symbolBase": "ONE",
      "configType": 1,
      "source": 4,
      "icon": "https://nuls-cf.oss-us-west-1.aliyuncs.com/icon/Harmony.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 105,
          "heterogeneousChainMultySignAddress": "0x0ea7ce4180e8bc484db4be9b497d9d106a3d7781",
          "contractAddress": "",
          "chainName": "Harmony",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 33,
      "nerveFlag": false,
      "usdPrice": 0.0716,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 6,
        "chain": "Harmony",
        "nativeId": 1666700000,
        "name": "one-1",
        "apiUrl": "https://api.s0.pops.one/"
      }
    ]
  },
  {
    "id": 30,
    "chain": "KCC",
    "chainName": "KCC",
    "prefix": "0x",
    "nativeId": 322,
    "chainId": 107,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/KCC.png",
    "apiUrl": "https://rpc-testnet.kcc.network",
    "scanUrl": "https://scan-testnet.kcc.network/",
    "psUrl": "https://faucet-testnet.kcc.network/",
    "sort": 8,
    "status": 1,
    "bridge": 1,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0x0111E01E78af5608e33569Edd997Fe2f700A0721",
      "crossAddress": "0x1329d995EB0c8FD1e20fa1f9ee12e9fE4c67c60a",
      "nft": ""
    },
    "mainAsset": {
      "id": 18895,
      "chain": "KCC",
      "registerChain": "KCC",
      "chainId": 107,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "KCS",
      "symbol": "KCS",
      "symbolBase": "KCS",
      "configType": 1,
      "source": 4,
      "icon": "https://nuls-cf.oss-us-west-1.aliyuncs.com/icon/KCC.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 107,
          "heterogeneousChainMultySignAddress": "0x1329d995eb0c8fd1e20fa1f9ee12e9fe4c67c60a",
          "contractAddress": "",
          "chainName": "KCC",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 35,
      "nerveFlag": false,
      "usdPrice": 15.8989,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 8,
        "chain": "KCC",
        "nativeId": 322,
        "name": "kcc-1",
        "apiUrl": "https://rpc-testnet.kcc.network"
      }
    ]
  },
  {
    "id": 36,
    "chain": "Cronos",
    "chainName": "Cronos",
    "prefix": "0x",
    "nativeId": 338,
    "chainId": 109,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/cronos.png",
    "apiUrl": "https://cronos-testnet-3.crypto.org:8545",
    "scanUrl": "https://cronos.crypto.org/explorer/testnet3/",
    "psUrl": "https://cronos.crypto.org/faucet",
    "sort": 9,
    "status": 1,
    "bridge": 1,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0x452085c1eD74B38169DaEe194312FA8Db4818C19",
      "crossAddress": "0xb339211438Dcbf3D00d7999ad009637472FC72b3",
      "nft": ""
    },
    "mainAsset": {
      "id": 19034,
      "chain": "Cronos",
      "registerChain": "Cronos",
      "chainId": 109,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "CRO",
      "symbol": "CRO",
      "symbolBase": "CRO",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/cronos.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 109,
          "heterogeneousChainMultySignAddress": "0xb339211438dcbf3d00d7999ad009637472fc72b3",
          "contractAddress": "",
          "chainName": "Cronos",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 93,
      "nerveFlag": false,
      "usdPrice": 0.2562,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 14,
        "chain": "Cronos",
        "nativeId": 338,
        "name": "cronos-1",
        "apiUrl": "https://cronos-testnet-3.crypto.org:8545"
      }
    ]
  },
  {
    "id": 43,
    "chain": "TRON",
    "chainName": "TRON",
    "prefix": "T",
    "nativeId": 100000001,
    "chainId": 108,
    "chainType": 3,
    "intro": null,
    "icon": "https://files.nabox.io/icon/tron.png",
    "apiUrl": "grpc.shasta.trongrid.io:50051",
    "scanUrl": "https://shasta.tronscan.org/",
    "psUrl": "https://api.shasta.trongrid.io/jsonrpc",
    "sort": 9,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "TJfF8mmmy3Br1VvBygq16TSnnsiNL6LEBD",
      "crossAddress": "TYVxuksybZdbyQwoR25V2YUgXYAHikcLro",
      "nft": ""
    },
    "mainAsset": {
      "id": 19161,
      "chain": "TRON",
      "registerChain": "TRON",
      "chainId": 108,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 6,
      "assetName": "TRX",
      "symbol": "TRX",
      "symbolBase": "TRX",
      "configType": 1,
      "source": 9,
      "icon": "https://files.nabox.io/icon/tron.png",
      "nulsCross": true,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 104,
          "heterogeneousChainMultySignAddress": "0xb490f2a3ec0b90e5faa1636be046d82ab7cdac74",
          "contractAddress": "0x2785f6458c3bab956ccb1542f602c69d1188b28f",
          "chainName": "OKC",
          "token": true
        },
        {
          "heterogeneousChainId": 108,
          "heterogeneousChainMultySignAddress": "TYVxuksybZdbyQwoR25V2YUgXYAHikcLro",
          "contractAddress": "",
          "chainName": "TRON",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 55,
      "nerveFlag": false,
      "usdPrice": 0.0875,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 23,
        "chain": "TRON",
        "nativeId": 100000001,
        "name": "tron-1",
        "apiUrl": ""
      }
    ]
  },
  {
    "id": 37,
    "chain": "Arbitrum",
    "chainName": "Arbitrum",
    "prefix": "0x",
    "nativeId": 421611,
    "chainId": 111,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Arbitrum.png",
    "apiUrl": "https://rinkeby.arbitrum.io/rpc",
    "scanUrl": "https://testnet.arbiscan.io/",
    "psUrl": "https://faucets.chain.link/rinkeby",
    "sort": 10,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0xC1f4F265EC8A46ad19740E7d3c6960db4c595dE5",
      "crossAddress": "0x830befa62501F1073ebE2A519B882e358f2a0318",
      "nft": "arb"
    },
    "mainAsset": {
      "id": 19036,
      "chain": "Arbitrum",
      "registerChain": "Arbitrum",
      "chainId": 111,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "AETH",
      "symbol": "AETH",
      "symbolBase": "AETH",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/Arbitrum.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 111,
          "heterogeneousChainMultySignAddress": "0x830befa62501f1073ebe2a519b882e358f2a0318",
          "contractAddress": "",
          "chainName": "Arbitrum",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 95,
      "nerveFlag": false,
      "usdPrice": 2519.8469,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 16,
        "chain": "Arbitrum",
        "nativeId": 421611,
        "name": "arbitrum-1",
        "apiUrl": "https://rinkeby.arbitrum.io/rpc"
      }
    ]
  },
  {
    "id": 38,
    "chain": "Fantom",
    "chainName": "Fantom",
    "prefix": "0x",
    "nativeId": 4002,
    "chainId": 112,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Fantom.png",
    "apiUrl": "https://rpc.testnet.fantom.network",
    "scanUrl": "https://testnet.ftmscan.com/",
    "psUrl": "https://faucet.fantom.network/",
    "sort": 11,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "multiCallAddress": "0xC1f4F265EC8A46ad19740E7d3c6960db4c595dE5",
      "crossAddress": "0x8999d8738CC9B2E1fb1D01E1af732421D53Cb2A9",
      "nft": ""
    },
    "mainAsset": {
      "id": 19037,
      "chain": "Fantom",
      "registerChain": "Fantom",
      "chainId": 112,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "FTM",
      "symbol": "FTM",
      "symbolBase": "FTM",
      "configType": 1,
      "source": 4,
      "icon": "https://files.nabox.io/icon/Fantom.png",
      "nulsCross": false,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 112,
          "heterogeneousChainMultySignAddress": "0x8999d8738cc9b2e1fb1d01e1af732421d53cb2a9",
          "contractAddress": "",
          "chainName": "Fantom",
          "token": false
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 96,
      "nerveFlag": false,
      "usdPrice": 0.677,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 17,
        "chain": "Fantom",
        "nativeId": 4002,
        "name": "fantom-1",
        "apiUrl": "https://rpc.testnet.fantom.network"
      }
    ]
  },
  {
    "id": 39,
    "chain": "CSC",
    "chainName": "CSC",
    "prefix": "0x",
    "nativeId": 52,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/CoinEx.jpeg",
    "apiUrl": "https://rpc.coinex.net/",
    "scanUrl": "https://www.coinex.net/",
    "psUrl": "",
    "sort": 12,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xC1f4F265EC8A46ad19740E7d3c6960db4c595dE5",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19051,
      "chain": "CSC",
      "registerChain": "CSC",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "CET",
      "symbol": "CET",
      "symbolBase": "CET",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/CoinEx.jpeg",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 19,
        "chain": "CSC",
        "nativeId": 52,
        "name": "csc-1",
        "apiUrl": "https://rpc.coinex.net/"
      }
    ]
  },
  {
    "id": 41,
    "chain": "Optimistic",
    "chainName": "Optimistic",
    "prefix": "0x",
    "nativeId": 10,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/op.png",
    "apiUrl": "https://mainnet.optimism.io/",
    "scanUrl": "https://optimistic.etherscan.io/",
    "psUrl": null,
    "sort": 12,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19075,
      "chain": "optimistic",
      "registerChain": "optimistic",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "OETH",
      "symbol": "OETH",
      "symbolBase": "OETH",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/op.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 21,
        "chain": "Optimistic",
        "nativeId": 10,
        "name": "optimistic-1",
        "apiUrl": "https://mainnet.optimism.io/"
      }
    ]
  },
  {
    "id": 44,
    "chain": "Rinkeby",
    "chainName": "Rinkeby",
    "prefix": "0x",
    "nativeId": 4,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Ethereum.jpeg",
    "apiUrl": "https://rinkeby.infura.io/v3/7e086d9f3bdc48e4996a3997b33b032f",
    "scanUrl": "https://rinkeby.etherscan.io",
    "psUrl": "",
    "sort": 12,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": "eth"
    },
    "mainAsset": {
      "id": 19146,
      "chain": "Rinkeby",
      "registerChain": "Rinkeby",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "ETH",
      "symbol": "ETH",
      "symbolBase": "ETH",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Ethereum.jpeg",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 24,
        "chain": "Rinkeby",
        "nativeId": 4,
        "name": "rinkeby-1",
        "apiUrl": "https://rinkeby.infura.io/v3/7e086d9f3bdc48e4996a3997b33b032f"
      }
    ]
  },
  {
    "id": 40,
    "chain": "IoTeX",
    "chainName": "IoTeX",
    "prefix": "0x",
    "nativeId": 4689,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/IOTEX.png",
    "apiUrl": "https://babel-api.mainnet.iotex.io/",
    "scanUrl": "https://iotexscan.io/",
    "psUrl": null,
    "sort": 13,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xf5b4224Fae4f3900417e73Ea626f86476D2181f3",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19074,
      "chain": "IoTeX",
      "registerChain": "IoTeX",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "IOTX",
      "symbol": "IOTX",
      "symbolBase": "IOTX",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/IOTEX.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 20,
        "chain": "IoTeX",
        "nativeId": 4689,
        "name": "iotex-1",
        "apiUrl": "https://babel-api.mainnet.iotex.io/"
      }
    ]
  },
  {
    "id": 53,
    "chain": "Celo",
    "chainName": "Celo",
    "prefix": "0x",
    "nativeId": 42220,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/CELO.png",
    "apiUrl": "https://forno.celo.org",
    "scanUrl": "https://explorer.celo.org",
    "psUrl": null,
    "sort": 15,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19259,
      "chain": "Celo",
      "registerChain": "Celo",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "CELO",
      "symbol": "CELO",
      "symbolBase": "CELO",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/CELO.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 36,
        "chain": "Celo",
        "nativeId": 42220,
        "name": "celo-1",
        "apiUrl": "https://forno.celo.org"
      }
    ]
  },
  {
    "id": 52,
    "chain": "Klaytn",
    "chainName": "Klaytn",
    "prefix": "0x",
    "nativeId": 8217,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Klaytn.png",
    "apiUrl": "https://public-node-api.klaytnapi.com/v1/cypress",
    "scanUrl": "https://scope.klaytn.com",
    "psUrl": null,
    "sort": 16,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19258,
      "chain": "Klaytn",
      "registerChain": "Klaytn",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "KLAY",
      "symbol": "KLAY",
      "symbolBase": "KLAY",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Klaytn.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 35,
        "chain": "Klaytn",
        "nativeId": 8217,
        "name": "klaytn-1",
        "apiUrl": "https://public-node-api.klaytnapi.com/v1/cypress"
      }
    ]
  },
  {
    "id": 50,
    "chain": "Gnosis",
    "chainName": "Gnosis",
    "prefix": "0x",
    "nativeId": 100,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/xdai_1.png",
    "apiUrl": "https://rpc.gnosischain.com",
    "scanUrl": "https://blockscout.com/xdai/mainnet",
    "psUrl": null,
    "sort": 17,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19254,
      "chain": "Gnosis",
      "registerChain": "Gnosis",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "xDAI",
      "symbol": "xDAI",
      "symbolBase": "xDAI",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/xdai_1.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 33,
        "chain": "Gnosis",
        "nativeId": 100,
        "name": "gnosis-1",
        "apiUrl": "https://rpc.gnosischain.com"
      }
    ]
  },
  {
    "id": 42,
    "chain": "Aurora",
    "chainName": "Aurora",
    "prefix": "0x",
    "nativeId": 1313161554,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/aurora_1.png",
    "apiUrl": "https://mainnet.aurora.dev",
    "scanUrl": "https://aurorascan.dev",
    "psUrl": null,
    "sort": 18,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19105,
      "chain": "Aurora",
      "registerChain": "Aurora",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "AETH",
      "symbol": "AETH",
      "symbolBase": "AETH",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/aurora_1.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 22,
        "chain": "Aurora",
        "nativeId": 1313161554,
        "name": "aurora-1",
        "apiUrl": "https://mainnet.aurora.dev"
      }
    ]
  },
  {
    "id": 49,
    "chain": "Theta",
    "chainName": "Theta",
    "prefix": "0x",
    "nativeId": 361,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Theta.png",
    "apiUrl": "https://eth-rpc-api.thetatoken.org/rpc/",
    "scanUrl": "https://explorer.thetatoken.org/",
    "psUrl": null,
    "sort": 19,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19253,
      "chain": "Theta",
      "registerChain": "Theta",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "TFUEL",
      "symbol": "TFUEL",
      "symbolBase": "TFUEL",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Theta.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 32,
        "chain": "Theta",
        "nativeId": 361,
        "name": "theta-1",
        "apiUrl": "https://eth-rpc-api.thetatoken.org/rpc/"
      }
    ]
  },
  {
    "id": 48,
    "chain": "Moonriver",
    "chainName": "Moonriver",
    "prefix": "0x",
    "nativeId": 1285,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Moonriver.png",
    "apiUrl": "https://rpc.api.moonriver.moonbeam.network/",
    "scanUrl": "https://moonriver.moonscan.io/",
    "psUrl": null,
    "sort": 21,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19241,
      "chain": "Moonriver",
      "registerChain": "Moonriver",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "MOVR",
      "symbol": "MOVR",
      "symbolBase": "MOVR",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Moonriver.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 31,
        "chain": "Moonriver",
        "nativeId": 1285,
        "name": "moonriver-1",
        "apiUrl": "https://rpc.api.moonriver.moonbeam.network/"
      }
    ]
  },
  {
    "id": 51,
    "chain": "Moonbeam",
    "chainName": "Moonbeam",
    "prefix": "0x",
    "nativeId": 1284,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Moonbeam.png",
    "apiUrl": "https://rpc.api.moonbeam.network/",
    "scanUrl": "https://moonbeam.moonscan.io/",
    "psUrl": null,
    "sort": 22,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19255,
      "chain": "Moonbeam",
      "registerChain": "Moonbeam",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "GLMR",
      "symbol": "GLMR",
      "symbolBase": "GLMR",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Moonbeam.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 34,
        "chain": "Moonbeam",
        "nativeId": 1284,
        "name": "moonbeam-1",
        "apiUrl": "https://rpc.api.moonbeam.network/"
      }
    ]
  },
  {
    "id": 46,
    "chain": "Oasis",
    "chainName": "Oasis",
    "prefix": "0x",
    "nativeId": 42262,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Oasis-1.png",
    "apiUrl": "https://emerald.oasis.dev",
    "scanUrl": "https://explorer.emerald.oasis.dev",
    "psUrl": null,
    "sort": 23,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19239,
      "chain": "Oasis",
      "registerChain": "Oasis",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "ROSE",
      "symbol": "ROSE",
      "symbolBase": "ROSE",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Oasis-1.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 29,
        "chain": "Oasis",
        "nativeId": 42262,
        "name": "oasis-1",
        "apiUrl": "https://emerald.oasis.dev"
      }
    ]
  },
  {
    "id": 45,
    "chain": "Wanchain",
    "chainName": "Wanchain",
    "prefix": "0x",
    "nativeId": 888,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Wanchain-1.png",
    "apiUrl": "https://gwan-ssl.wandevs.org:56891",
    "scanUrl": "https://www.wanscan.org",
    "psUrl": null,
    "sort": 24,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0x6899aA135037a4C8a3cAB11622d35CEa4CD63747",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19238,
      "chain": "Wanchain",
      "registerChain": "Wanchain",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "WAN",
      "symbol": "WAN",
      "symbolBase": "WAN",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/Wanchain-1.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 28,
        "chain": "Wanchain",
        "nativeId": 888,
        "name": "wanchain-1",
        "apiUrl": "https://gwan-ssl.wandevs.org:56891"
      }
    ]
  },
  {
    "id": 47,
    "chain": "smartBCH",
    "chainName": "smartBCH",
    "prefix": "0x",
    "nativeId": 10000,
    "chainId": 0,
    "chainType": 2,
    "intro": null,
    "icon": "https://files.nabox.io/icon/smartBCH.png",
    "apiUrl": "https://smartbch.greyh.at",
    "scanUrl": "https://smartbch.org/",
    "psUrl": null,
    "sort": 25,
    "status": 1,
    "bridge": 0,
    "swap": 0,
    "configs": {
      "multiCallAddress": "0xd1F3BE686D64e1EA33fcF64980b65847aA43D79C",
      "crossAddress": "",
      "nft": ""
    },
    "mainAsset": {
      "id": 19240,
      "chain": "smartBCH",
      "registerChain": "smartBCH",
      "chainId": 0,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 18,
      "assetName": "BCH",
      "symbol": "BCH",
      "symbolBase": "BCH",
      "configType": 1,
      "source": 0,
      "icon": "https://files.nabox.io/icon/smartBCH-1.png",
      "nulsCross": false,
      "heterogeneousList": null,
      "nerveChainId": 0,
      "nerveAssetId": 0,
      "nerveFlag": false,
      "usdPrice": 0,
      "usdPlatform": null,
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 30,
        "chain": "smartBCH",
        "nativeId": 10000,
        "name": "smartbch-1",
        "apiUrl": "https://smartbch.greyh.at"
      }
    ]
  },
  {
    "id": 22,
    "chain": "NULS",
    "chainName": "NULS",
    "prefix": "tNULS",
    "nativeId": -1,
    "chainId": 2,
    "chainType": 1,
    "intro": null,
    "icon": "https://files.nabox.io/icon/Nuls.png",
    "apiUrl": "http://149.129.251.238:18004/jsonrpc",
    "scanUrl": "http://beta.nulscan.io/",
    "psUrl": "http://149.129.251.238:18003",
    "sort": 98,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "feeAddress": "tNULSeBaMomrBpDYJrfm49LcJ2nJKrNT5TEdam",
      "destroyAddress": "tNULSeBaMhZnRteniCy3UZqPjTbnWKBPHX1a5d",
      "nft": ""
    },
    "mainAsset": {
      "id": 17694,
      "chain": "NULS",
      "registerChain": "NULS",
      "chainId": 2,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 8,
      "assetName": "NULS",
      "symbol": "NULS",
      "symbolBase": "NULS",
      "configType": 1,
      "source": 7,
      "icon": "https://files.nabox.io/icon/NULS.png",
      "nulsCross": true,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 102,
          "heterogeneousChainMultySignAddress": "0xf85f03c3faac61acf7b187513aef10041029a1b2",
          "contractAddress": "0x72755f739b56ef98bda25e2622c63add229dec01",
          "chainName": "BSC",
          "token": true
        },
        {
          "heterogeneousChainId": 103,
          "heterogeneousChainMultySignAddress": "0x19d90d3c8eb0c0b3e3093b054031ff1ca81704b8",
          "contractAddress": "0x74a163fcd791ec7aab2204ffabf1a1dfb8854883",
          "chainName": "Heco",
          "token": true
        },
        {
          "heterogeneousChainId": 104,
          "heterogeneousChainMultySignAddress": "0xb490f2a3ec0b90e5faa1636be046d82ab7cdac74",
          "contractAddress": "0xd8eb69948e214da7fd8da6815c9945f175a4fce7",
          "chainName": "OKC",
          "token": true
        },
        {
          "heterogeneousChainId": 105,
          "heterogeneousChainMultySignAddress": "0x0ea7ce4180e8bc484db4be9b497d9d106a3d7781",
          "contractAddress": "0x97893f1d41d151a9eec36d5b5a94cc3514d2c852",
          "chainName": "Harmony",
          "token": true
        },
        {
          "heterogeneousChainId": 106,
          "heterogeneousChainMultySignAddress": "0xfe05820bae725fd093e9c1cb6e40ab3bdc40def2",
          "contractAddress": "0x97893f1d41d151a9eec36d5b5a94cc3514d2c852",
          "chainName": "Polygon",
          "token": true
        },
        {
          "heterogeneousChainId": 107,
          "heterogeneousChainMultySignAddress": "0x1329d995eb0c8fd1e20fa1f9ee12e9fe4c67c60a",
          "contractAddress": "0x97893f1d41d151a9eec36d5b5a94cc3514d2c852",
          "chainName": "KCC",
          "token": true
        }
      ],
      "nerveChainId": 2,
      "nerveAssetId": 1,
      "nerveFlag": false,
      "usdPrice": 0.3726,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 2,
        "chain": "NULS",
        "nativeId": -1,
        "name": "nuls-1",
        "apiUrl": "http://149.129.251.238:18004/jsonrpc"
      },
      {
        "id": 26,
        "chain": "NULS",
        "nativeId": -1,
        "name": "nuls-2",
        "apiUrl": "http://161.117.11.137:18004/jsonrpc"
      }
    ]
  },
  {
    "id": 23,
    "chain": "NERVE",
    "chainName": "NERVE",
    "prefix": "TNVT",
    "nativeId": -2,
    "chainId": 5,
    "chainType": 1,
    "intro": null,
    "icon": "https://files.nabox.io/icon/NERVE.png",
    "apiUrl": "http://beta.api.nerve.network/jsonrpc",
    "scanUrl": "http://beta.scan.nerve.network/",
    "psUrl": "http://beta.public.nerve.network/jsonrpc",
    "sort": 99,
    "status": 1,
    "bridge": 1,
    "swap": 1,
    "configs": {
      "feeAddress": "TNVTdTSPP9oSLvdtVSVFiUYCvXJdj1ZA1nyQU",
      "destroyAddress": "TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY",
      "nft": ""
    },
    "mainAsset": {
      "id": 17218,
      "chain": "NERVE",
      "registerChain": "NERVE",
      "chainId": 5,
      "assetId": 1,
      "contractAddress": "",
      "decimals": 8,
      "assetName": "NVT",
      "symbol": "NVT",
      "symbolBase": "NVT",
      "configType": 1,
      "source": 7,
      "icon": "https://files.nabox.io/icon/NVT.png",
      "nulsCross": true,
      "heterogeneousList": [
        {
          "heterogeneousChainId": 101,
          "heterogeneousChainMultySignAddress": "0x5e1cba794ad91fcd272fdaf2cd91b6110b601ed2",
          "contractAddress": "0x2cc112629954377620a20ce4fd730df8d977e6fe",
          "chainName": "Ethereum",
          "token": true
        },
        {
          "heterogeneousChainId": 112,
          "heterogeneousChainMultySignAddress": "0x8999d8738cc9b2e1fb1d01e1af732421d53cb2a9",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Fantom",
          "token": true
        },
        {
          "heterogeneousChainId": 102,
          "heterogeneousChainMultySignAddress": "0xf85f03c3faac61acf7b187513aef10041029a1b2",
          "contractAddress": "0x477fe38678c166ccf0e2d6cfa755216e2a09118e",
          "chainName": "BSC",
          "token": true
        },
        {
          "heterogeneousChainId": 103,
          "heterogeneousChainMultySignAddress": "0x19d90d3c8eb0c0b3e3093b054031ff1ca81704b8",
          "contractAddress": "0x3139dbe1bf7feb917cf8e978b72b6ead764b0e6c",
          "chainName": "Heco",
          "token": true
        },
        {
          "heterogeneousChainId": 104,
          "heterogeneousChainMultySignAddress": "0xb490f2a3ec0b90e5faa1636be046d82ab7cdac74",
          "contractAddress": "0xf7915d4de86b856f3e51b894134816680bf09eee",
          "chainName": "OKC",
          "token": true
        },
        {
          "heterogeneousChainId": 105,
          "heterogeneousChainMultySignAddress": "0x0ea7ce4180e8bc484db4be9b497d9d106a3d7781",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Harmony",
          "token": true
        },
        {
          "heterogeneousChainId": 106,
          "heterogeneousChainMultySignAddress": "0xfe05820bae725fd093e9c1cb6e40ab3bdc40def2",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Polygon",
          "token": true
        },
        {
          "heterogeneousChainId": 107,
          "heterogeneousChainMultySignAddress": "0x1329d995eb0c8fd1e20fa1f9ee12e9fe4c67c60a",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "KCC",
          "token": true
        },
        {
          "heterogeneousChainId": 108,
          "heterogeneousChainMultySignAddress": "TYVxuksybZdbyQwoR25V2YUgXYAHikcLro",
          "contractAddress": "TYMQT8152SicTSDuNEob6t6QRLfet1xrMn",
          "chainName": "TRON",
          "token": true
        },
        {
          "heterogeneousChainId": 109,
          "heterogeneousChainMultySignAddress": "0xb339211438dcbf3d00d7999ad009637472fc72b3",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Cronos",
          "token": true
        },
        {
          "heterogeneousChainId": 110,
          "heterogeneousChainMultySignAddress": "0x8999d8738cc9b2e1fb1d01e1af732421d53cb2a9",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Avalanche",
          "token": true
        },
        {
          "heterogeneousChainId": 111,
          "heterogeneousChainMultySignAddress": "0x830befa62501f1073ebe2a519b882e358f2a0318",
          "contractAddress": "0xcea7f9f0354da1db6b649f25767412ec78c2fbf8",
          "chainName": "Arbitrum",
          "token": true
        }
      ],
      "nerveChainId": 5,
      "nerveAssetId": 1,
      "nerveFlag": false,
      "usdPrice": 0.0212,
      "usdPlatform": "feixiaohao",
      "usdUrl": null
    },
    "assets": [],
    "urlList": [
      {
        "id": 1,
        "chain": "NERVE",
        "nativeId": -2,
        "name": "nvt-1",
        "apiUrl": "http://beta.api.nerve.network/jsonrpc"
      }
    ]
  }
]

export default beta
