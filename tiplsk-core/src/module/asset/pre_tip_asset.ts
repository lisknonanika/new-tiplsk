import { BaseAsset, ValidateAssetContext, ApplyAssetContext } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { txTipSchema, TxTip, CsPendingTxElem } from '../../schema';
import { tiplskConfig } from '../../conf';
import * as common from '../../common';

export const PreTipAssetID = 10;

export class PreTipAsset extends BaseAsset { 
  name = 'pre-tipAsset';
  id = PreTipAssetID;
  schema = txTipSchema;

  public validate({ asset, transaction }: ValidateAssetContext<TxTip>): void {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.recipientId) throw new Error(`Invalid parameter: "content.recipientId"`);
    if (!asset.recipientNm) throw new Error(`Invalid parameter: "content.recipientNm"`);
    if (!asset.amount) throw new Error(`Invalid parameter: "content.amount"`);
    if (bufferToHex(transaction.senderAddress) !== tiplskConfig.address) throw new Error(`Sender is not TipLSK."`);
  }

  public async apply({ asset, stateStore, transaction }: ApplyAssetContext<TxTip>): Promise<void> {
    // get chain state
    const linkAccount = await common.getLinkAccount(asset.type, asset.senderId, null, stateStore);
    if (!linkAccount) throw new Error(`Account is unregistered.`);

    // update chain state - pending transaction
    const param: CsPendingTxElem = {
      type: "tip",
      id: transaction.id,
      height: stateStore.chain.lastBlockHeaders[0].height,
      expHeight: stateStore.chain.lastBlockHeaders[0].height + tiplskConfig.height.expired,
      content: {
        type: asset.type,
        senderId: asset.senderId,
        recipientId: asset.recipientId,
        recipientNm: asset.recipientNm,
        amount: asset.amount.toString()
      }
    }
    await common.addPendingTxs(param, stateStore);
  }
}