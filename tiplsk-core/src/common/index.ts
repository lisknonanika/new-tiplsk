import { codec, StateStore } from 'lisk-sdk';
import {
  csLinkAccountSchema, csPendingTxSchema,
  CsLinkAccount, CsLinkAccountElem,
  CsPendingTx, CsPendingTxElem, 
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../schema';

export const getLinkAccount = async(type: string, id: string, address: string, stateStore: StateStore): Promise<CsLinkAccountElem | undefined> => {
  try {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    if (!buf) return undefined;
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    if (address) return cs.link.find(v => v.type === type && v.id === id && v.address === address);
    return cs.link.find(v => v.type === type && v.id === id);

  } catch (err) {
    return undefined;
  }
}

export const updateLinkAccount = async(type: string, id: string, address: string, stateStore: StateStore): Promise<void> => {
  const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
  let data: CsLinkAccountElem[] = [];
  if (buf) {
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    data = cs.link.filter(v => v.type !== type || v.id !== id);
  }
  data.push({type: type, id: id, address: address});
  await stateStore.chain.set(CS_LINK_ACCOUNT, codec.encode(csLinkAccountSchema, {link: data}));
}

export const getPendingTx = async(type: string, txId: string, stateStore: StateStore): Promise<CsPendingTxElem | undefined> => {
  if (txId) return undefined;
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  if (!buf) return undefined;
  const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
  const data = cs.tx.find(v => {
    return v.type === type && v.id === txId
  });
  return data;
}

export const addPendingTxs = async(param: any, stateStore: StateStore): Promise<void> => {
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  let data: CsPendingTxElem[] = [];
  if (buf) data = codec.decode<CsPendingTx>(csPendingTxSchema, buf).tx;
  data.push(param);
  await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
}

export const removePendingTx = async(type: string, txId: string, stateStore: StateStore): Promise<void> => {
  if (!txId) return;
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  let data: CsPendingTxElem[] = [];
  if (buf) {
    const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
    data = cs.tx.filter(v => v.type !== type || v.id !== txId);
  }
  await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
}