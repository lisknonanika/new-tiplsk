import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { bufferToHex, getAddressFromBase32Address } from '@liskhq/lisk-cryptography';
import { RPC_ENDPOINT, TIPLSK } from '../conf';
import { CommandResult, Registration } from '../type';

const createTx = async (client: APIClient, asset: Registration): Promise<Record<string, unknown>> => {
  const preTx = await client.transaction.create({moduleID: 3000, assetID: 0, fee: BigInt(0), asset: asset}, TIPLSK.PASSPHRASE);
  const fee = client.transaction.computeMinFee(preTx);
  const txFee = BigInt(Math.ceil(Number(fee) / 10000) * 10000);
  return await client.transaction.create({moduleID: 3000, assetID: 0, fee: txFee, asset: asset}, TIPLSK.PASSPHRASE)
}

export const execute = async(type: string, senderId: string, address: string): Promise<CommandResult> => {
  let client: APIClient | undefined = undefined;

  try {
    client = await createWSClient(RPC_ENDPOINT);

    const asset: Registration = {
      type: type.toLowerCase(),
      senderId: senderId,
      address: getAddressFromBase32Address(address, "tip")
    }
    const tx = await createTx(client, asset);
    await client.transaction.send(tx);
    return {result: true, data: Buffer.isBuffer(tx.id)? bufferToHex(tx.id): ""};

  } catch (err) {
    console.log(err);
    return {result: false, data: err.message? err.message: "system error"};
    
  } finally {
    if (client) await client.disconnect();
  }
}