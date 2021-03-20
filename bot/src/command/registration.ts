import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { bufferToHex, getAddressFromBase32Address } from '@liskhq/lisk-cryptography';
import { RPC_ENDPOINT, TIPLSK } from '../const';
import { CommandResult, Registration } from '../type';

let client: APIClient | undefined = undefined;

const createTx = async (client: APIClient, asset: Registration): Promise<Record<string, unknown>> => {
  const preTx = await client.transaction.create({moduleID: 3000, assetID: 0, fee: BigInt(0), asset: asset}, TIPLSK.PASSPHRASE);
  const fee = client.transaction.computeMinFee(preTx);
  const txFee = BigInt(Math.ceil(Number(fee) / 10000) * 10000);
  return await client.transaction.create({moduleID: 3000, assetID: 0, fee: txFee, asset: asset}, TIPLSK.PASSPHRASE)
}

export const execute = async(type: string, command: string, senderId: string): Promise<CommandResult> => {
  try {
    client = await createWSClient(RPC_ENDPOINT);
    const words: string[] = command.split(/\s/g);
    // const address = getAddressFromBase32Address(words[words.length -1], "tip");  // TODO https://github.com/LiskHQ/lisk-sdk/issues/6185
    const address = getAddressFromBase32Address(`lsk${words[words.length -1].slice(3)}`);

    const asset: Registration = {
      type: type.toLowerCase(),
      senderId: senderId,
      address: address
    }
    const tx = await createTx(client, asset);
    await client.transaction.send(tx);
    return {result: true, data: Buffer.isBuffer(tx.id)? bufferToHex(tx.id): ""};

  } catch (err) {
    console.log(err);
    return {result: false, message: err.message? err.message: "system error"};
    
  } finally {
    if (client) await client.disconnect();
  }
}