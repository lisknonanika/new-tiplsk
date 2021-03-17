import * as genesisBlock from './genesis_block.json';
import * as appConfig from './app_config.json';

const tiplskConfig = {
  tiplsk: {
    address: "9cabee3d27426676b852ce6b804cb2fdff7cd0b5",
    passphrase: "endless focus guilt bronze hold economy bulk parent soon tower cement venue"
  },
  height: {
    expired: 360,
    remove: 720
  },
  faucet: {
    enable: true,
    amount: "10"
  }
}
export { genesisBlock, appConfig, tiplskConfig };