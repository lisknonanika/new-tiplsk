import { BaseAsset, codec, ValidateAssetContext, ApplyAssetContext, StateStore, Transaction } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { convertLSKToBeddows } from '@liskhq/lisk-transactions';
import {
  TipLskAccount,
  txRegistrationSchema, csLinkAccountSchema, csPendingTxSchema,
  TxRegistration, CsLinkAccount, CsLinkAccountElem, CsPendingTx, CsPendingTxElem,
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../../schema';
import { tiplskConfig } from '../../conf';

export const PreRegistrationAssetID = 0;

export class PreRegistrationAsset extends BaseAsset { 
  name = 'pre-registrationAsset';
  id = PreRegistrationAssetID;
  schema = txRegistrationSchema;

  public validate({ asset }: ValidateAssetContext<TxRegistration>): void {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.address) throw new Error(`Invalid parameter: "content.address"`);
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<TxRegistration>): Promise<void> {
    // get block height
    const currentHeight = BigInt(stateStore.chain.lastBlockHeaders[0].height);

    // get chain state - link account
    const linkAccount = await this.getLinkAccount(asset, stateStore);
    if (linkAccount)  throw new Error(`Account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);

    // update chain state - pending transaction
    await this.updatePendingTxs(asset, stateStore, transaction, currentHeight);

    // faucet
    if (tiplskConfig.faucet.enable) {
      let data = undefined;
      try {
        data = await stateStore.account.get<TipLskAccount>(asset.address)
      } catch (err) {
        // nothing
      }
      if (!data) {
        await reducerHandler.invoke("token:credit", {
          address: asset.address,
          amount: BigInt(convertLSKToBeddows(tiplskConfig.faucet.amount))
        });
      }
    }

    // get account & update account
    const target = await stateStore.account.getOrDefault<TipLskAccount>(asset.address);
    stateStore.account.set(target.address, target);
  }

  private async getLinkAccount(asset: TxRegistration, stateStore: StateStore): Promise<CsLinkAccountElem | undefined> {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    if (!buf) return undefined;
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    const data = cs.link.find(v => v.type === asset.type && (v.id === asset.senderId || v.address === bufferToHex(asset.address)));
    return data;
  }

  private async updatePendingTxs(asset: TxRegistration, stateStore: StateStore, transaction: Transaction, currentHeight: bigint): Promise<void> {
    const buf = await stateStore.chain.get(CS_PENDING_TX);
    let data: CsPendingTxElem[] = [];
    if (buf) {
      const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
      data = cs.tx.filter(v => BigInt(v.height) + BigInt(tiplskConfig.height.remove) > currentHeight);
    }
    data.push({
      type: "registration",
      id: bufferToHex(transaction.id),
      height: currentHeight.toString(),
      content: {type: asset.type, senderId: asset.senderId, address: bufferToHex(asset.address)}
    });
    await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
  }
}