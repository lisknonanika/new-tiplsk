const { BaseModule, codec } = require('lisk-sdk');
const { PreRegistrationAsset, RegistrationAsset, PreTipAsset } = require('./asset');
const {
  accountSchema,
  chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT,
  chainStatePendingTxSchema, CHAIN_STATE_PENDING_TX
} = require('../schema');

class TipLskModule extends BaseModule { 
  name = 'tiplsk'; 
  id = 3000; 
  accountSchema = accountSchema;
  transactionAssets = [ new PreRegistrationAsset(), new RegistrationAsset(), new PreTipAsset() ];
  events = [];

  actions = {
    linkAccount: async () => {
      const chainStateLinkAccountBuffer = await this._dataAccess.getChainState(CHAIN_STATE_LINK_ACCOUNT);
      const linkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
      return linkAccount;
    },
    pendingTx: async () => {
      const chainStatePendingTxBuffer = await this._dataAccess.getChainState(CHAIN_STATE_PENDING_TX);
      const pendingTx = codec.decode(chainStatePendingTxSchema, chainStatePendingTxBuffer);
      return pendingTx;
    },
  };

  async afterGenesisBlockApply({genesisBlock, stateStore, reducerHandler}) { 
    await stateStore.chain.set(CHAIN_STATE_LINK_ACCOUNT, codec.encode(chainStateLinkAccountSchema, {link: []}));
    await stateStore.chain.set(CHAIN_STATE_PENDING_TX, codec.encode(chainStatePendingTxSchema, {tx: []}));
  };
}

module.exports = TipLskModule;