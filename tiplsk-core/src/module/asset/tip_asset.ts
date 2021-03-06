import { BaseAsset, ValidateAssetContext, ApplyAssetContext } from 'lisk-sdk';
import { bufferToHex, hexToBuffer } from '@liskhq/lisk-cryptography';
import { txTipSchema, TxTip } from '../../schema';
import * as common from '../../common';

export const TipAssetID = 11;

export class TipAsset extends BaseAsset { 
  name = 'tipAsset';
  id = TipAssetID;
  schema = txTipSchema;

  public validate({ asset }: ValidateAssetContext<TxTip>): void {
    if (!asset.txId) throw new Error(`Invalid parameter: "txId"`);
    if (!asset.type) throw new Error(`Invalid parameter: "type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "senderId"`);
    if (!asset.recipientId) throw new Error(`Invalid parameter: "recipientId"`);
    if (!asset.recipientNm) throw new Error(`Invalid parameter: "recipientNm"`);
    if (!asset.amount) throw new Error(`Invalid parameter: "amount"`);
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<TxTip>): Promise<void> {
    // get chain state
    const senderAccount = await common.getLinkAccount(asset.type, asset.senderId, null, stateStore);
    if (!senderAccount) throw new Error(`Sender account is unregistered.`);
    if (senderAccount.address !== bufferToHex(transaction.senderAddress)) throw new Error(`Sender address do not match.`);

    const recipientAccount = await common.getLinkAccount(asset.type, asset.recipientId, null, stateStore);
    if (!recipientAccount) throw new Error(`Recipient Account is unregistered.`);

    // get chain state - Pending transaction
    const pendingTx = await common.getPendingTxByTxId("tip", asset.txId? asset.txId: null, stateStore);
    if (!pendingTx) throw new Error(`Pending Transaction is not found.`);

    // update chain state - pending transaction
    await common.removePendingTx("tip", asset.txId? asset.txId: null, stateStore);

    // update balance
    await reducerHandler.invoke("token:credit", {address: hexToBuffer(recipientAccount.address), amount: asset.amount});
    await reducerHandler.invoke("token:debit", {address: hexToBuffer(senderAccount.address), amount: asset.amount});
  }
}