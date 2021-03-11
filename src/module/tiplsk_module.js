const { BaseModule, codec } = require('lisk-sdk');
const { RegistrationAsset, AddTipAsset } = require('./asset');
const { accountSchema, chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT } = require('../schema');

class TipLskModule extends BaseModule { 
  name = 'tiplsk'; 
  id = 3000; 
  accountSchema = accountSchema;
  transactionAssets = [ new RegistrationAsset(), new AddTipAsset() ];
  events = [];

  actions = { 
    linkAccount: async () => {
      const chainStateLinkAccountBuffer = await this._dataAccess.getChainState(CHAIN_STATE_LINK_ACCOUNT);
      const linkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
      return linkAccount;
    },
  };

  async afterGenesisBlockApply({genesisBlock, stateStore, reducerHandler}) { 
    await stateStore.chain.set(CHAIN_STATE_LINK_ACCOUNT, codec.encode(chainStateLinkAccountSchema, {link: []}));
  };
}

module.exports = TipLskModule;