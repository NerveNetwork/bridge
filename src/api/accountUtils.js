import { ethers } from 'ethers';
import { generateTronAddress } from '@/api/tronApi';
import nerve from 'nerve-sdk-js';
import { MAIN_INFO, NULS_INFO } from '@/config';

/**
 * @desc 生成EVM异构网络地址
 * @param pub 公钥
 */
export function getHeterogeneousAddress(pub) {
  return ethers.utils.computeAddress(ethers.utils.hexZeroPad(ethers.utils.hexStripZeros('0x' + pub), 33));
}

/**
 * @desc 生成Tron网络地址
 * @param pub 公钥
 */
export function getTronAddress(pub) {
  return generateTronAddress(pub)
}

/**
 * @desc 生成NULS、NERVE地址
 * @param pub 公钥
 */
export function getNAddress(pub, isNULS = true) {
  const config = isNULS ? NULS_INFO :MAIN_INFO;
  return nerve.getAddressByPub(config.chainId, config.assetId, pub, config.prefix);
}

export function getAddress(pub, config) {
  const address = {};
  const EVMAddress = getHeterogeneousAddress(pub);
  for(let chain in config) {
    if (chain !== 'NULS' && chain !== 'NERVE' && chain !== 'TRON') {
      address[chain] = EVMAddress
    }
  }
  if (config.hasOwnProperty('TRON')) {
    address.TRON = getTronAddress(pub);
  }
  address.NULS = getNAddress(pub, true);
  address.NERVE = getNAddress(pub, false);
  return address
}