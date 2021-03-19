const apiClient = require('@liskhq/lisk-api-client');
const { hexToBuffer } = require('@liskhq/lisk-cryptography');
const { tiplskConfig } = require('../dist/conf');

const RPC_ENDPOINT = 'ws://127.0.0.1:8080/ws';

const ceilFee = (fee) => BigInt(Math.ceil(fee / 10000) * 10000);

const createTx = async (client, fee) => {
    return await client.transaction.create({
        moduleID: 3000,
        assetID: 0,
        fee: fee,
        asset: {
            type: "twitter",
            senderId: "12345678912312312",
            address: hexToBuffer("9cabee3d27426676b852ce6b804cb2fdff7cd0b5")
        }
    }, tiplskConfig.tiplsk.passphrase);
}

(async () => {
    try {
        const client = await apiClient.createWSClient(RPC_ENDPOINT);
        console.log((await client.invoke('tiplsk:pendingTx')));
        const preTx = await createTx(client, BigInt(0));
        const txFee = client.transaction.computeMinFee(preTx).toString();
        const tx = await createTx(client, ceilFee(+txFee));
        const res = await client.transaction.send(tx);
        console.log(res);
        
    } catch (err) {
        console.log(err.message);
    }
})();