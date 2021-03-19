import * as accountSchema from './json/account_schema.json';
import * as txRegistrationSchema from './json/tx_registration_schema.json';
import * as txTipSchema from './json/tx_tip_schema.json';
import * as csLinkAccountSchema from './json/chain_state_link_account_schema.json';
import * as csPendingTxSchema from './json/chain_state_pending_tx_schema.json';
import {
  TipLskAccount,
  TxRegistration, TxTip,
  CsLinkAccount, CsLinkAccountElem,
  CsPendingTx, CsPendingTxElem
} from './type';

const CS_LINK_ACCOUNT = "tiplsk:linkAccount";
const CS_PENDING_TX = "tiplsk:pendingTx";

export {
  accountSchema, 
  txRegistrationSchema,  txTipSchema, 
  csLinkAccountSchema, csPendingTxSchema,
  TipLskAccount, TxRegistration, TxTip,
  CsLinkAccount, CsLinkAccountElem, CsPendingTx, CsPendingTxElem,
  CS_LINK_ACCOUNT, CS_PENDING_TX
};