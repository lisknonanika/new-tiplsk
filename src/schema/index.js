const accountSchema = require('./json/account_schema.json');
const chainStateLinkAccountSchema = require('./json/chain_state_link_account_schema.json');
const chainStatePendingTxSchema = require('./json/chain_state_pending_tx_schema.json');
const txRegistrationSchema = require('./json/tx_registration_schema.json');
const txTipSchema = require('./json/tx_tip_schema.json');

const CHAIN_STATE_LINK_ACCOUNT = "tiplsk:linkAccount";
const CHAIN_STATE_PENDING_TX = "tiplsk:pendingTx";

module.exports = {
  accountSchema,
  chainStateLinkAccountSchema,
  chainStatePendingTxSchema,
  txRegistrationSchema,
  txTipSchema,
  CHAIN_STATE_LINK_ACCOUNT,
  CHAIN_STATE_PENDING_TX
};