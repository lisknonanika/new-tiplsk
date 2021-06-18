import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import { convertLSKToBeddows } from '@liskhq/lisk-transactions';
import { RPC_ENDPOINT, TIPLSK } from '../conf';
import { CommandResult, Tip } from '../type';

const createTx = async (client: APIClient, asset: Tip): Promise<Record<string, unknown>> => {
  const preTx = await client.transaction.create({moduleID: 3000, assetID: 10, fee: BigInt(0), asset: asset}, TIPLSK.PASSPHRASE);
  const fee = client.transaction.computeMinFee(preTx);
  const txFee = BigInt(Math.ceil(Number(fee) / 10000) * 10000);
  return await client.transaction.create({moduleID: 3000, assetID: 10, fee: txFee, asset: asset}, TIPLSK.PASSPHRASE)
}

export const execute = async(type: string, senderId: string, recipientId: string, recipientNm: string, amount: string): Promise<CommandResult> => {
  let client: APIClient | undefined = undefined;

  try {
    client = await createWSClient(RPC_ENDPOINT);
  
    const asset: Tip = {
      type: type.toLowerCase(),
      senderId: senderId,
      recipientId: recipientId,
      recipientNm: recipientNm,
      amount: BigInt(convertLSKToBeddows(amount))
    }
    const tx = await createTx(client, asset);
    await client.transaction.send(tx);
    return {result: true, data: Buffer.isBuffer(tx.id)? bufferToHex(tx.id): ""};

  } catch (err) {
    console.log(err);
    return {result: false, data: err.message? err.message: "system error"}
    
  } finally {
    if (client) await client.disconnect();
  }
}