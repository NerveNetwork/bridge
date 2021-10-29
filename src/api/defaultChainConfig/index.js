import betaConfig from './beta'
import mainConfig from './main'
import { isBeta } from '@/api/util'

const config = isBeta ? betaConfig : mainConfig;

export default config;