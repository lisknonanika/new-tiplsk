const apiClient = require('@liskhq/lisk-api-client');
const { hexToBuffer } = require('@liskhq/lisk-cryptography');
const conf = require('../src/conf');

const RPC_ENDPOINT = 'ws://127.0.0.1:8080/ws';

let client = undefined;

const ceilFee = (fee) => BigInt(Math.ceil(fee / 10000) * 10000);

const createRegistrationTx = async (client, fee) => {
    return await client.transaction.create({
        moduleID: 3000,
        assetID: 0,
        fee: fee,
        asset: {
            type: "twitter",
            senderId: "12345678912312312",
            address: hexToBuffer("fe4b6c7362ad277b871309090d0833c09fa9ebc2")
        }
    }, conf.tiplsk.passphrase);
}

const createAddTipTx = async (client, fee) => {
    return await client.transaction.create({
        moduleID: 3000,
        assetID: 10,
        fee: fee,
        asset: {
            type: "twitter",
            senderId: "12345678912312312",
            recipientId: "99999123123123123",
            amount: BigInt(100000000)
        }
    }, conf.tiplsk.passphrase);
}

(async () => {
    try {
        client = await apiClient.createWSClient(RPC_ENDPOINT);
        // const preTx = await createRegistrationTx(client, BigInt(0));
        // const txFee = client.transaction.computeMinFee(preTx).toString();
        // const tx = await createRegistrationTx(client, ceilFee(+txFee));
        // const res = await client.transaction.send(tx);
        // console.log(res);

        const preTx = await createAddTipTx(client, BigInt(0));
        const txFee = client.transaction.computeMinFee(preTx).toString();
        const tx = await createAddTipTx(client, ceilFee(+txFee));
        const res = await client.transaction.send(tx);
        console.log(res);
        
    } catch (err) {
        console.log(err);
    } finally {
        if (client) await client.disconnect();
    }
})();