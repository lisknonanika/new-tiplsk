import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK } from '@liskhq/lisk-transactions';
import { RPC_ENDPOINT, TIPLSK } from '../const';
import { CommandResult, Tip } from '../type';

let client: APIClient | undefined = undefined;

const createTx = async (client: APIClient, asset: Tip): Promise<Record<string, unknown>> => {
  const preTx = await client.transaction.create({moduleID: 3000, assetID: 10, fee: BigInt(0), asset: asset}, TIPLSK.PASSPHRASE);
  const fee = client.transaction.computeMinFee(preTx);
  const txFee = BigInt(Math.ceil(Number(fee) / 10000) * 10000);
  return await client.transaction.create({moduleID: 3000, assetID: 10, fee: txFee, asset: asset}, TIPLSK.PASSPHRASE)
}

export const execute = async(type: string, command: string, senderId: string, recipientId: string): Promise<CommandResult> => {
  try {
    client = await createWSClient(RPC_ENDPOINT);
    const words: string[] = command.split(/\s/g);
    const recipientNm = words[words.length -2];
    const amount = words[words.length -1];
  
    const asset: Tip = {
      type: type.toLowerCase(),
      senderId: senderId,
      recipientId: recipientId,
      recipientNm: recipientNm,
      amount: BigInt(convertBeddowsToLSK(amount))
    }
    const tx = await createTx(client, asset);
    await client.transaction.send(tx);
    return {result: true, data: Buffer.isBuffer(tx.id)? bufferToHex(tx.id): ""};

  } catch (err) {
    console.log(err);
    return {result: false, message: err.message? err.message: "system error"}
    
  } finally {
    if (client) await client.disconnect();
  }
}