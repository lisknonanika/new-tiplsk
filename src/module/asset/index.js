const { RegistrationAssetID, RegistrationAsset } = require('./registration_asset');
const { PreRegistrationAssetID, PreRegistrationAsset } = require('./pre_registration_asset');
const { PreTipAsset, PreTipAssetID } = require('./pre_tip_asset');

module.exports = {
  PreRegistrationAssetID, PreRegistrationAsset,
  RegistrationAssetID, RegistrationAsset,
  PreTipAssetID, PreTipAsset
}