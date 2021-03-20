import * as genesisBlock from './genesis_block.json';
import * as appConfig from './app_config.json';

export { genesisBlock, appConfig };
export const tiplskConfig = {
  height: {
    expired: 720
  },
  faucet: {
    enable: true,
    amount: "10"
  }
}