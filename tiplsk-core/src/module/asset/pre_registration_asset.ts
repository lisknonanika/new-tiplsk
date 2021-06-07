import { BaseAsset, ValidateAssetContext, ApplyAssetContext } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { convertLSKToBeddows } from '@liskhq/lisk-transactions';
import { TipLskAccount, txRegistrationSchema, TxRegistration } from '../../schema';
import { tiplskConfig } from '../../conf';
import * as common from '../../common';

export const PreRegistrationAssetID = 0;

export class PreRegistrationAsset extends BaseAsset { 
  name = 'pre-registrationAsset';
  id = PreRegistrationAssetID;
  schema = txRegistrationSchema;

  public validate({ asset, transaction }: ValidateAssetContext<TxRegistration>): void {
    if (!asset.type) throw new Error(`Invalid parameter: "content.type"`);
    if (!asset.senderId) throw new Error(`Invalid parameter: "content.senderId"`);
    if (!asset.address) throw new Error(`Invalid parameter: "content.address"`);
    if (bufferToHex(transaction.senderAddress) !== tiplskConfig.address) throw new Error(`Sender is not TipLSK."`);
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<TxRegistration>): Promise<void> {
    // get chain state - Link account
    const linkAccount = await common.getLinkAccount(asset.type, asset.senderId, bufferToHex(asset.address), stateStore);
    if (linkAccount) throw new Error(`Same account already exists: Type="${linkAccount.type}", ID="${linkAccount.id}", Address="${linkAccount.address}"`);
    
    // update chain state - pending transaction
    const param = {
      type: "registration",
      id: bufferToHex(transaction.id),
      height: stateStore.chain.lastBlockHeaders[0].height.toString(),
      content: {type: asset.type, senderId: asset.senderId, address: bufferToHex(asset.address)}
    }
    await common.addPendingTxs(param, stateStore);

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
}