import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { hexToBuffer, getBase32AddressFromAddress } from '@liskhq/lisk-cryptography';
import { RPC_ENDPOINT } from '../const';
import { LinkAccount, CommandResult } from '../type';

export const execute = async(type: string, senderId: string): Promise<CommandResult> => {
  let client: APIClient | undefined = undefined;

  try {
    client = await createWSClient(RPC_ENDPOINT);
    const ret = await client.invoke<LinkAccount>("tiplsk:linkAccount");
    if (!ret || !ret.link) return {result: true, message: "Not Link"};
    const account = ret.link.find(v => v.type === type && v.id === senderId);
    if (!account) return {result: true, message: "Not Link"};
    return {result: true, data: `Address: ${getBase32AddressFromAddress(hexToBuffer(account.id), "tip")}`};

  } catch (err) {
    console.log(err);
    return {result: false, message: err.message? err.message: "system error"};

  } finally {
    if (client) await client.disconnect();
  }
}