const config = require('./config.json')
const RPC_ENDPOINT = config.RPC_ENDPOINT;
const HOST = config.HOST;
const SERVICE_URL = config.SERVICE_URL;

module.exports = {
  RPC_ENDPOINT,
  HOST,
  SERVICE_URL
}