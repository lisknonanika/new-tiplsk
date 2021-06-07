import { BaseAsset, ValidateAssetContext, ApplyAssetContext } from 'lisk-sdk';
import { bufferToHex, hexToBuffer } from '@liskhq/lisk-cryptography';
import { txTipSchema, TxTip } from '../../schema';
import { tiplskConfig } from '../../conf';
import * as common from '../../common';

export const TipAssetID = 11;

export class TipAsset extends BaseAsset { 
  name = 'tipAsset';
  id = TipAssetID;
  schema = txTipSchema;

  public validate({ asset, transaction }: ValidateAssetContext<TxTip>): void {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.recipientId) throw new Error(`Invalid parameter: "content.recipientId"`);
    if (!asset.recipientNm) throw new Error(`Invalid parameter: "content.recipientNm"`);
    if (!asset.amount) throw new Error(`Invalid parameter: "content.amount"`);
    if (bufferToHex(transaction.senderAddress) !== tiplskConfig.address) throw new Error(`Sender is not TipLSK."`);
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<TxTip>): Promise<void> {
    // get chain state
    const senderAccount = await common.getLinkAccount(asset.type, asset.senderId, "", stateStore);
    if (!senderAccount) throw new Error(`Sender Account is unregistered: Type="${asset.type}", ID="${asset.senderId}"`);
    if (senderAccount.address !== bufferToHex(transaction.senderAddress)) throw new Error(`Sender missmatch: Type="${asset.type}", ID="${asset.senderId}"`);

    const recipientAccount = await common.getLinkAccount(asset.type, asset.senderId, "", stateStore);
    if (!recipientAccount) throw new Error(`Recipient Account is unregistered: Type="${asset.type}", ID="${asset.recipientId}"`);

    // get chain state - Pending transaction
    const pendingTx = await common.getPendingTx("tip", asset.txId? bufferToHex(asset.txId): "", stateStore);
    if (!pendingTx) throw new Error(`Pending Transaction is not found: ID="${asset.txId? bufferToHex(asset.txId): undefined}"`);

    // update chain state - pending transaction
    await common.removePendingTx("tip", asset.txId? bufferToHex(asset.txId): "", stateStore);

    // update balance
    await reducerHandler.invoke("token:credit", {address: hexToBuffer(recipientAccount.address), amount: asset.amount});
    await reducerHandler.invoke("token:debit", {address: hexToBuffer(senderAccount.address), amount: asset.amount});
  }
}