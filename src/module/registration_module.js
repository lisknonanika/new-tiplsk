const { BaseModule, codec } = require('lisk-sdk');
const { RegistrationAsset, RegistrationAssetID } = require('./registration_asset');
const { txRegistrationSchema, accountSchema } = require('../schema');

class RegistrationModule extends BaseModule { 
  name = 'tiplsk'; 
  id = 3000; 
  accountSchema = accountSchema;
  transactionAssets = [ new RegistrationAsset() ];
  events = ['registration']; 

  async afterTransactionApply({transaction, stateStore, reducerHandler}) { 
    if (transaction.moduleID === this.id && transaction.assetID === RegistrationAssetID) {
      const registrationAsset = codec.decode(txRegistrationSchema, transaction.asset);
      this._channel.publish('tiplsk:registration', {
        sender: transaction._senderAddress.toString('hex'),
        type: registrationAsset.type,
        id: registrationAsset.id,
        address: registrationAsset.address.toString('hex'),
      });
    }
  };
}

module.exports = RegistrationModule;