const accountSchema = require('./json/account_schema.json');
const chainStateLinkAccountSchema = require('./json/chain_state_link_account_schema.json');
const txRegistrationSchema = require('./json/tx_registration_schema.json');
const txAddTipSchema = require('./json/tx_add_tip_schema.json');

const CHAIN_STATE_LINK_ACCOUNT = "tiplsk:linkAccount";

module.exports = {
  accountSchema,
  chainStateLinkAccountSchema,
  txRegistrationSchema,
  txAddTipSchema,
  CHAIN_STATE_LINK_ACCOUNT
};