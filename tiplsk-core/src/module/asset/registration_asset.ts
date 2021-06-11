import { BaseAsset, ValidateAssetContext, ApplyAssetContext } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { TipLskAccount, txRegistrationSchema, TxRegistration } from '../../schema';
import * as common from '../../common';

export const RegistrationAssetID = 1;

export class RegistrationAsset extends BaseAsset { 
  name = 'registrationAsset';
  id = RegistrationAssetID;
  schema = txRegistrationSchema;

  public validate({ asset, transaction }: ValidateAssetContext<TxRegistration>): void {
    if (!asset.txId) throw new Error(`Invalid parameter: "txId"`);
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.address) throw new Error(`Invalid parameter: "content.address"`);
    if (asset.address !== transaction.senderAddress) throw new Error(`Sender address do not match.`);
  }

  public async apply({ asset, stateStore }: ApplyAssetContext<TxRegistration>): Promise<void> {
    // get chain state - Link account
    const linkAccount = await common.getLinkAccount(asset.type, asset.senderId, null, stateStore);
    if (linkAccount && bufferToHex(asset.address) === bufferToHex(linkAccount.address))  throw new Error(`Same account is already registerd.`);

    // get chain state - Pending transaction
    const pendingTx = await common.getPendingTxByTxId("registration", asset.txId? asset.txId: null, stateStore);
    if (!pendingTx) throw new Error(`Pending Transaction is not found.`);
    if (!pendingTx.content.address)  throw new Error(`Pending Transaction is not correct.`);
    if (bufferToHex(pendingTx.content.address) !== bufferToHex(asset.address)) throw new Error(`Sender address do not match.`);
    
    // update old account
    if (linkAccount) {
      const target = await stateStore.account.get<TipLskAccount>(linkAccount.address);
      if (target) {
        const newLink = target.tiplsk.link.filter(v => v.type !== asset.type || v.id !== asset.senderId);
        target.tiplsk.link = newLink;
        stateStore.account.set(target.address, target);
      }
    }

    // update account
    const target = await stateStore.account.get<TipLskAccount>(asset.address);
    if (!target) throw new Error(`Account is not found`);
    const newLink = target.tiplsk.link.filter(v => v.type !== asset.type || v.id !== asset.senderId);
    newLink.push({type: asset.type, id: asset.senderId});
    target.tiplsk.link = newLink;
    stateStore.account.set(target.address, target);

    // update chain state - Link account
    await common.updateLinkAccount(asset.type, asset.senderId, asset.address, stateStore);

    // update chain state - Pending transaction
    await common.removePendingTx("registration", asset.txId? asset.txId: null, stateStore);
  }
}