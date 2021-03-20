import * as accountSchema from './json/account_schema.json';
import * as txRegistrationSchema from './json/tx_registration_schema.json';
import * as txTipSchema from './json/tx_tip_schema.json';
import * as csLinkAccountSchema from './json/chain_state_link_account_schema.json';
import * as csPendingTxSchema from './json/chain_state_pending_tx_schema.json';
export {
  accountSchema, 
  txRegistrationSchema,  txTipSchema, 
  csLinkAccountSchema, csPendingTxSchema
};

export {
  TipLskAccount,
  TxRegistration, TxTip,
  CsLinkAccount, CsLinkAccountElem,
  CsPendingTx, CsPendingTxElem
} from './type';

export const CS_LINK_ACCOUNT = "tiplsk:linkAccount";
export const CS_PENDING_TX = "tiplsk:pendingTx";