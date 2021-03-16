const apiClient = require('@liskhq/lisk-api-client');
const { hexToBuffer } = require('@liskhq/lisk-cryptography');
const conf = require('../src/conf');

const RPC_ENDPOINT = 'ws://127.0.0.1:8080/ws';

let client = undefined;

const ceilFee = (fee) => BigInt(Math.ceil(fee / 10000) * 10000);

const createPreRegistrationTx = async (client, fee) => {
    return await client.transaction.create({
        moduleID: 3000,
        assetID: 0,
        fee: fee,
        asset: {
            type: "twitter",
            senderId: "12345678912312312",
            address: hexToBuffer("9cabee3d27426676b852ce6b804cb2fdff7cd0b5")
        }
    }, conf.tiplsk.passphrase);
}

const createRegistrationTx = async (client, fee) => {
    return await client.transaction.create({
        moduleID: 3000,
        assetID: 1,
        fee: fee,
        asset: {
            txId: hexToBuffer('2df9ba4c8fe058c76738778e3f30f683705436e48165b2b1185e7f9a2c1d70aa'),
            type: "twitter",
            senderId: "12345678912312312",
            address: hexToBuffer("9cabee3d27426676b852ce6b804cb2fdff7cd0b5")
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
        console.log((await client.invoke('tiplsk:pendingTx')));
        const preTx = await createPreRegistrationTx(client, BigInt(0));
        const txFee = client.transaction.computeMinFee(preTx).toString();
        const tx = await createPreRegistrationTx(client, ceilFee(+txFee));
        const res = await client.transaction.send(tx);
        console.log(res);

        // const preTx = await createRegistrationTx(client, BigInt(0));
        // const txFee = client.transaction.computeMinFee(preTx).toString();
        // const tx = await createRegistrationTx(client, ceilFee(+txFee));
        // const res = await client.transaction.send(tx);
        // console.log(res);

        // const preTx = await createAddTipTx(client, BigInt(0));
        // const txFee = client.transaction.computeMinFee(preTx).toString();
        // const tx = await createAddTipTx(client, ceilFee(+txFee));
        // const res = await client.transaction.send(tx);
        // console.log(res);
        
    } catch (err) {
        console.log(err.message);
    } finally {
        if (client) await client.disconnect();
    }
})();