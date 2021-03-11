const { BaseAsset, codec } = require('lisk-sdk');
const { txRegistrationSchema, chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT } = require('../schema');
const { convertLSKToBeddows } = require('@liskhq/lisk-transactions');
const { bufferToHex } = require('@liskhq/lisk-cryptography');

const RegistrationAssetID = 0;

class RegistrationAsset extends BaseAsset { 
  name = 'registrationAsset'; 
  id = RegistrationAssetID; 
  schema = txRegistrationSchema;

  async apply({ asset, stateStore, reducerHandler, transaction }) {
    // get chain state
    const chainStateLinkAccountBuffer = await stateStore.chain.get(CHAIN_STATE_LINK_ACCOUNT);
    const chainStateLinkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
    const linkAccount = chainStateLinkAccount.link.find(v => v.type === asset.type && v.address === bufferToHex(asset.address));
    if (linkAccount)  throw new Error(`${linkAccount.type} Account already exists: ID="${linkAccount.id}"`);

    // get account
    const recipient = await stateStore.account.getOrDefault(asset.address);

    // update account
    const isNewAccount = !recipient.tiplsk;
    if (isNewAccount) recipient.tiplsk = {link: [], tx: []};
    recipient.tiplsk.link.push({type: asset.type, id: asset.senderId});
    stateStore.account.set(recipient.address, recipient);

    // update balance (fauset)
    if (isNewAccount) await reducerHandler.invoke("token:credit", {address: recipient.address, amount: BigInt(convertLSKToBeddows("10"))});

    // update chain state(Link Account)
    chainStateLinkAccount.link.push({type: asset.type, id: asset.senderId, address: bufferToHex(asset.address)});
    await stateStore.chain.set(CHAIN_STATE_LINK_ACCOUNT, codec.encode(chainStateLinkAccountSchema, chainStateLinkAccount));
  }
}

module.exports = { RegistrationAsset, RegistrationAssetID };