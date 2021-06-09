const registration = require('../bot/dist/command/registration');
const apiClient = require('@liskhq/lisk-api-client');
const { RPC_ENDPOINT } = require('../bot/dist/const');

(async ()=> {
  const ret1 = await registration.execute("twitter", "1234567890", "tipgame2jsvqktwwx2txppudvxt2v8dtdfvxdbrhg")
  console.log(ret1)

  const client = await apiClient.createWSClient(RPC_ENDPOINT);
  try {

  } finally {
    await client.disconnect()
  }
  const ret2 = await client.invoke('tiplsk:pendingTx');
  console.log(ret2)
})()