const { BaseAsset, codec } = require('lisk-sdk');
const { bufferToHex } = require('@liskhq/lisk-cryptography');
const { convertLSKToBeddows } = require('@liskhq/lisk-transactions');
const {
  txRegistrationSchema,
  chainStateLinkAccountSchema, CHAIN_STATE_LINK_ACCOUNT,
  chainStatePendingTxSchema, CHAIN_STATE_PENDING_TX
} = require('../../schema');
const conf = require('../../conf');

const PreRegistrationAssetID = 0;

class PreRegistrationAsset extends BaseAsset { 
  name = 'pre-registrationAsset';
  id = PreRegistrationAssetID;
  schema = txRegistrationSchema;

  validate({ asset }) {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.address) throw new Error(`Invalid parameter: "content.address"`);
  }

  async apply({ asset, stateStore, reducerHandler, transaction }) {
    // get chain state
    const chainStateLinkAccountBuffer = await stateStore.chain.get(CHAIN_STATE_LINK_ACCOUNT);
    const chainStateLinkAccount = codec.decode(chainStateLinkAccountSchema, chainStateLinkAccountBuffer);
    const linkAccount = chainStateLinkAccount.link.find(v => {
      return v.type === asset.type && (v.id === asset.senderId || v.address === bufferToHex(asset.address))
    });
    if (linkAccount)  throw new Error(`Account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);

    // update chain state - pending transaction
    const chainStatePendingTxBuffer = await stateStore.chain.get(CHAIN_STATE_PENDING_TX);
    const chainStatePendingTx = codec.decode(chainStatePendingTxSchema, chainStatePendingTxBuffer);
    const currentHeight = stateStore.chain.lastBlockHeaders[0].height;
    const pendingTx = chainStatePendingTx.tx.filter(v => BigInt(v.height) + BigInt(conf.height.remove) > currentHeight);
    pendingTx.push({
      type: "registration",
      id: bufferToHex(transaction.id),
      height: currentHeight.toString(),
      content: {
        type: asset.type,
        senderId: asset.senderId,
        address: bufferToHex(asset.address)
      }
    });
    await stateStore.chain.set(CHAIN_STATE_PENDING_TX, codec.encode(chainStatePendingTxSchema, {tx: pendingTx}));

     // create new account
     const target = await stateStore.account.getOrDefault(asset.address);
     if(!target.tiplsk) {
      target.tiplsk = {link: []};
      stateStore.account.set(target.address, target);

      // faucet
      if (conf.faucet.enable) {
        await reducerHandler.invoke("token:credit", {
          address: target.address,
          amount: BigInt(convertLSKToBeddows(conf.faucet.amount))
        });
       }
      }
  }
}

module.exports = { PreRegistrationAsset, PreRegistrationAssetID };