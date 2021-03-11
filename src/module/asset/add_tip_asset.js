const { BaseAsset, codec } = require('lisk-sdk');
const { hexToBuffer, bufferToHex } = require('@liskhq/lisk-cryptography');
const { txAddTipSchema, chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT } = require('../../schema');

const AddTipAssetID = 10;

class AddTipAsset extends BaseAsset { 
  name = 'addTipAsset'; 
  id = AddTipAssetID; 
  schema = txAddTipSchema;

  async apply({ asset, stateStore, reducerHandler, transaction }) {
    // get chain state
    const chainStateLinkAccountBuffer = await stateStore.chain.get(CHAIN_STATE_LINK_ACCOUNT);
    const chainStateLinkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
    const senderAccount = chainStateLinkAccount.link.find(v => v.type === asset.type && v.id === asset.senderId);
    if (!senderAccount) throw new Error(`${linkAccount.type} Account is not linked.`);

    // get account
    const sender = await stateStore.account.get(hexToBuffer(senderAccount.address));

    // update account
    sender.tiplsk.tx.push({id: bufferToHex(transaction.id), type: asset.type, recipientId: asset.recipientId, amount: asset.amount, timestamp: new Date().getTime().toString()});
    stateStore.account.set(sender.address, sender);

    // update balance (fauset)
    await reducerHandler.invoke("token:debit", {address: sender.address, amount: asset.amount});
  }
}

module.exports = { AddTipAsset, AddTipAssetID };