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
    if (bufferToHex(asset.address) !== bufferToHex(transaction.senderAddress)) throw new Error(`Invalid parameter: "content.address"`);
  }

  public async apply({ asset, stateStore }: ApplyAssetContext<TxRegistration>): Promise<void> {
    // get chain state - Link account
    const linkAccount = await common.getLinkAccount(asset.type, asset.senderId, bufferToHex(asset.address), stateStore);
    if (linkAccount)  throw new Error(`Same account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);

    // get chain state - Pending transaction
    const pendingTx = await common.getPendingTx("registration", asset.txId? bufferToHex(asset.txId): "", stateStore);
    if (!pendingTx) throw new Error(`Pending Transaction is not found: ID="${asset.txId? bufferToHex(asset.txId): undefined}"`);
    
    // update account
    const target = await stateStore.account.get<TipLskAccount>(asset.address);
    if (!target) throw new Error(`account is not found`);
    target.tiplsk.link.push({type: asset.type, id: asset.senderId});
    stateStore.account.set(target.address, target);

    // update chain state - Link account
    await common.updateLinkAccount(asset.type, asset.senderId, bufferToHex(asset.address), stateStore);

    // update chain state - Pending transaction
    await common.removePendingTx("registration", asset.txId? bufferToHex(asset.txId): "", stateStore);
  }
}