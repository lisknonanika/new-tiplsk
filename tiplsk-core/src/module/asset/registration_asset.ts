import { BaseAsset, codec, ValidateAssetContext, ApplyAssetContext, StateStore } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import {
  TipLskAccount,
  txRegistrationSchema, csLinkAccountSchema, csPendingTxSchema,
  TxRegistration, CsLinkAccount, CsLinkAccountElem, CsPendingTx, CsPendingTxElem,
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../../schema';

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
    const linkAccount = await this.getLinkAccount(asset, stateStore);
    if (linkAccount)  throw new Error(`Same account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);

    // get chain state - Pending transaction
    const pendingTx = await this.getPendingTx(asset, stateStore);
    if (!pendingTx) throw new Error(`Pending Transaction is not found: ID="${asset.txId? bufferToHex(asset.txId): undefined}"`);
    
    // update account
    const target = await stateStore.account.get<TipLskAccount>(asset.address);
    if (!target) throw new Error(`account is not found`);
    target.tiplsk.link.push({type: asset.type, id: asset.senderId});
    stateStore.account.set(target.address, target);

    // update chain state - Link account
    await this.updateLinkAccount(asset, stateStore);

    // update chain state - Pending transaction
    await this.updatePendingTx(asset, stateStore);
  }

  private async getLinkAccount(asset: TxRegistration, stateStore: StateStore): Promise<CsLinkAccountElem | undefined> {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    if (!buf) return undefined;
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    const data = cs.link.find(v => v.type === asset.type && v.id === asset.senderId && v.address === bufferToHex(asset.address));
    return data;
  }

  private async updateLinkAccount(asset: TxRegistration, stateStore: StateStore): Promise<void> {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    let data: CsLinkAccountElem[] = [];
    if (buf) {
      const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
      data = cs.link.filter(v => v.type !== asset.type || v.id !== asset.senderId);
    }
    data.push({type: asset.type, id: asset.senderId, address: bufferToHex(asset.address)});
    await stateStore.chain.set(CS_LINK_ACCOUNT, codec.encode(csLinkAccountSchema, {link: data}));
  }

  private async getPendingTx(asset: TxRegistration, stateStore: StateStore): Promise<CsPendingTxElem | undefined> {
    const buf = await stateStore.chain.get(CS_PENDING_TX);
    if (!buf) return undefined;
    const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
    const data = cs.tx.find(v => {
      return v.type === "registration" &&
             asset.txId && v.id === bufferToHex(asset.txId) &&
             asset.type && v.content.type === asset.type &&
             asset.senderId && v.content.senderId === asset.senderId &&
             asset.address && v.content.address === bufferToHex(asset.address)
    });
    return data;
  }
  
  private async updatePendingTx(asset: TxRegistration, stateStore: StateStore): Promise<void> {
    const buf = await stateStore.chain.get(CS_PENDING_TX);
    let data: CsPendingTxElem[] = [];
    if (buf) {
      const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
      data = cs.tx.filter(v => v.type !== "registration" || !asset.txId || v.id !== bufferToHex(asset.txId));
    }
    await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
  }
}