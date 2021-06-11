import { BaseModule, codec, AfterGenesisBlockApplyContext, AfterBlockApplyContext } from 'lisk-sdk';
import { PreRegistrationAsset, RegistrationAsset, PreTipAsset } from './asset';
import {
  accountSchema, csLinkAccountSchema, csPendingTxSchema,
  CsLinkAccount, CsPendingTx,
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../schema';

export class TipLskModule extends BaseModule { 
  public name = 'tiplsk'; 
  public id = 3000; 
  public accountSchema = accountSchema;
  public transactionAssets = [ new PreRegistrationAsset(), new RegistrationAsset(), new PreTipAsset() ];

  public actions = {
    linkAccount: async () => {
      const chainStateLinkAccountBuffer = await this._dataAccess.getChainState(CS_LINK_ACCOUNT);
      if (!chainStateLinkAccountBuffer) return undefined;
      const linkAccount = codec.decode<CsLinkAccount>(csLinkAccountSchema, chainStateLinkAccountBuffer);
      return linkAccount;
    },
    pendingTx: async () => {
      const chainStatePendingTxBuffer = await this._dataAccess.getChainState(CS_PENDING_TX);
      if (!chainStatePendingTxBuffer) return undefined;
      const pendingTx = codec.decode<CsPendingTx>(csPendingTxSchema, chainStatePendingTxBuffer);
      return pendingTx;
    },
  };

  public async afterGenesisBlockApply({stateStore}: AfterGenesisBlockApplyContext): Promise<void> {
    await stateStore.chain.set(CS_LINK_ACCOUNT, codec.encode(csLinkAccountSchema, {link: []}));
    await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: []}));
  };

  public async afterBlockApply?({ stateStore, block }: AfterBlockApplyContext): Promise<void> {
    const buf = await stateStore.chain.get(CS_PENDING_TX);
    if (!buf) return;
    const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
    const data = cs.tx.filter(v => +v.expHeight > block.header.height);
    await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
  };
}