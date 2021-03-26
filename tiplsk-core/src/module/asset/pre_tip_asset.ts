import { BaseAsset, codec, ValidateAssetContext, ApplyAssetContext, StateStore, Transaction } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import {
  txTipSchema, csLinkAccountSchema, csPendingTxSchema,
  TxTip, CsLinkAccount, CsLinkAccountElem, CsPendingTx, CsPendingTxElem,
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../../schema';
import { tiplskConfig } from '../../conf';

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
    const linkAccount = await this.getLinkAccount(asset, stateStore);
    if (!linkAccount) throw new Error(`Account is unregistered: Type="${asset.type}", ID="${asset.senderId}"`);

    // update chain state - pending transaction
    await this.updatePendingTxs(asset, stateStore, transaction, stateStore.chain.lastBlockHeaders[0].height);
  }

  private async getLinkAccount(asset: TxTip, stateStore: StateStore): Promise<CsLinkAccountElem | undefined> {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    if (!buf) return undefined;
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    const data = cs.link.find(v => v.type === asset.type && v.id === asset.senderId);
    return data;
  }

  private async updatePendingTxs(asset: TxTip, stateStore: StateStore, transaction: Transaction, currentHeight: number): Promise<void> {
    const buf = await stateStore.chain.get(CS_PENDING_TX);
    let data: CsPendingTxElem[] = [];
    if (buf) data = codec.decode<CsPendingTx>(csPendingTxSchema, buf).tx;
    data.push({
      type: "tip",
      id: bufferToHex(transaction.id),
      height: currentHeight.toString(),
      content: {
        type: asset.type,
        senderId: asset.senderId,
        recipientId: asset.recipientId,
        recipientNm: asset.recipientNm,
        amount: asset.amount.toString()
      }
    });
    await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
  }
}