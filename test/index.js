const apiClient = require('@liskhq/lisk-api-client');
const { RPC_ENDPOINT } = require('../tiplsk-bot/dist/const');

(async ()=> {
  const client = await apiClient.createWSClient(RPC_ENDPOINT);
  try {
    const ret = await client.invoke('tiplsk:pendingTx');
    console.log(ret)

  } finally {
    await client.disconnect()
  }
})()