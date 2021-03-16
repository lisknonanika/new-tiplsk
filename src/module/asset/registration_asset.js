const { BaseAsset, codec } = require('lisk-sdk');
const { bufferToHex } = require('@liskhq/lisk-cryptography');
const {
  txRegistrationSchema,
  chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT,
  chainStatePendingTxSchema, CHAIN_STATE_PENDING_TX
} = require('../../schema');
const conf = require('../../conf');

const RegistrationAssetID = 1;

class RegistrationAsset extends BaseAsset { 
  name = 'registrationAsset';
  id = RegistrationAssetID;
  schema = txRegistrationSchema;

  validate({ asset, transaction }) {
    if (!asset.txId) throw new Error(`Invalid parameter: "txId"`);
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.address) throw new Error(`Invalid parameter: "content.address"`);
    if (bufferToHex(asset.address) !== bufferToHex(transaction.senderAddress)) throw new Error(`Invalid parameter: "content.address"`);
  }

  async apply({ asset, stateStore }) {
    // get chain state - Link account
    const chainStateLinkAccountBuffer = await stateStore.chain.get(CHAIN_STATE_LINK_ACCOUNT);
    const chainStateLinkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
    const linkAccount = chainStateLinkAccount.link.find(v => {
      return v.type === asset.type && (v.id === asset.senderId || v.address === bufferToHex(asset.address))
    });
    if (linkAccount)  throw new Error(`Account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);

    // get chain state - Pending transaction
    const chainStatePendingTxBuffer = await stateStore.chain.get(CHAIN_STATE_PENDING_TX);
    const chainStatePendingTx = codec.decode(chainStatePendingTxSchema, chainStatePendingTxBuffer);
    const currentHeight = stateStore.chain.lastBlockHeaders[0].height;
    const pendingTx = chainStatePendingTx.tx.find(v => {
      return BigInt(v.height) + BigInt(conf.height.expired) > currentHeight &&
             v.type === "registration" &&
             v.id === bufferToHex(asset.txId) &&
             v.content.type === asset.type &&
             v.content.senderId === asset.senderId &&
             v.content.address === bufferToHex(asset.address)
    });
    if (!pendingTx) throw new Error(`Pending Transaction is not found: ID="${bufferToHex(asset.txId)}"`);
    
    // update account
    const target = await stateStore.account.get(asset.address);
    if (!target) throw new Error(`${asset.address} is not found`);
    target.tiplsk.link.push({type: asset.type, id: asset.senderId});
    stateStore.account.set(target.address, target);

    // update chain state - Link account
    chainStateLinkAccount.link.push({type: asset.type, id: asset.senderId, address: bufferToHex(asset.address)});
    await stateStore.chain.set(CHAIN_STATE_LINK_ACCOUNT, codec.encode(chainStateLinkAccountSchema, chainStateLinkAccount));

    // update chain state - Pending transaction
    const newPendingTx = chainStatePendingTx.tx.filter(v => {
      return BigInt(v.height) + BigInt(conf.height.remove) > currentHeight &&
             (v.type !== "registration" || v.id !== bufferToHex(asset.txId))
    });
    await stateStore.chain.set(CHAIN_STATE_PENDING_TX, codec.encode(chainStatePendingTxSchema, {tx: newPendingTx}));
  }
}

module.exports = { RegistrationAsset, RegistrationAssetID };