import { APIClient, createWSClient } from '@liskhq/lisk-api-client';
import { getAddressFromBase32Address } from '@liskhq/lisk-cryptography';
import { convertLSKToBeddows } from '@liskhq/lisk-transactions';
import { RPC_ENDPOINT } from '../const';
import { CommandResult } from '../type';

let client: APIClient | undefined = undefined;

export const execute = async(command: string): Promise<CommandResult> => {
  try {
    client = await createWSClient(RPC_ENDPOINT);
    const words: string[] = command.split(/\s/g);
    const address = words[words.length -1];

    const ret = await client.account.get(getAddressFromBase32Address(address)) as any;
    if (!ret || !ret.data) return { result: false, message: "Address not found."};
    return {result: true, data: convertLSKToBeddows(ret.data.token.balance.toString())};

  } catch (err) {
    console.log(err);
    return {result: false, message: err.message? err.message: "system error"};

  } finally {
    if (client) await client.disconnect();
  }
}