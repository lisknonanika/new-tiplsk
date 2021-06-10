import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { hexToBuffer } from '@liskhq/lisk-cryptography';
import { convertLSKToBeddows } from '@liskhq/lisk-transactions';
import { RPC_ENDPOINT } from '../const';
import { LinkAccount, CommandResult } from '../type';

export const execute = async(type: string, senderId: string): Promise<CommandResult> => {
  let client: APIClient | undefined = undefined;
  
  try {
    client = await createWSClient(RPC_ENDPOINT);
    const linkResult = await client.invoke<LinkAccount>("tiplsk:linkAccount");
    if (!linkResult || !linkResult.link) return {result: true, data: "Unregistered"};
    const account = linkResult.link.find(v => v.type === type && v.id === senderId);
    if (!account) return {result: true, data: "Unregistered"};
    
    const ret = await client.account.get(hexToBuffer(account.id)) as any;
    if (!ret || !ret.data) return { result: true, data: "Address not found."};
    return {result: true, data: convertLSKToBeddows(ret.data.token.balance.toString())};

  } catch (err) {
    console.log(err);
    return {result: false, data: err.message? err.message: "system error"};

  } finally {
    if (client) await client.disconnect();
  }
}