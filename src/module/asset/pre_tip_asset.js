const { BaseAsset, codec } = require('lisk-sdk');
const { bufferToHex } = require('@liskhq/lisk-cryptography');
const {
  txTipSchema,
  chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT,
  chainStatePendingTxSchema, CHAIN_STATE_PENDING_TX
} = require('../../schema');
const conf = require('../../conf');

const PreTipAssetID = 10;

class PreTipAsset extends BaseAsset { 
  name = 'pre-tipAsset';
  id = PreTipAssetID;
  schema = txTipSchema;

  validate({ asset }) {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.recipientId) throw new Error(`Invalid parameter: "content.recipientId"`);
    if (!asset.amount) throw new Error(`Invalid parameter: "content.amount"`);
  }

  async apply({ asset, stateStore, transaction }) {
    // get chain state
    const chainStateLinkAccountBuffer = await stateStore.chain.get(CHAIN_STATE_LINK_ACCOUNT);
    const chainStateLinkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
    const senderAccount = chainStateLinkAccount.link.find(v => v.type === asset.type && v.id === asset.senderId);
    if (!senderAccount) throw new Error(`${linkAccount.type} Account is not linked.`);

    // update chain state - pending transaction
    const chainStatePendingTxBuffer = await stateStore.chain.get(CHAIN_STATE_PENDING_TX);
    const chainStatePendingTx = codec.decode(chainStatePendingTxSchema, chainStatePendingTxBuffer);
    const currentHeight = stateStore.chain.lastBlockHeaders[0].height;
    const pendingTx = chainStatePendingTx.tx.filter(v => BigInt(v.height) + BigInt(conf.height.remove) > currentHeight);
    pendingTx.push({
      type: "tip",
      id: bufferToHex(transaction.id),
      height: currentHeight.toString(),
      content: {
        type: asset.type,
        senderId: asset.senderId,
        recipientId: asset.recipientId,
        amount: asset.amount.toString()
      }
    });
    await stateStore.chain.set(CHAIN_STATE_PENDING_TX, codec.encode(chainStatePendingTxSchema, {tx: newChainStatePendingTx}));
  }
}

module.exports = { PreTipAsset, PreTipAssetID };