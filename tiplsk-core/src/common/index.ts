import { codec, StateStore } from 'lisk-sdk';
import { bufferToHex } from '@liskhq/lisk-cryptography';
import {
  csLinkAccountSchema, csPendingTxSchema,
  CsLinkAccount, CsLinkAccountElem,
  CsPendingTx, CsPendingTxElem, 
  CS_LINK_ACCOUNT, CS_PENDING_TX
} from '../schema';

export const getLinkAccount = async(type: string, id: string, address: Buffer|null, stateStore: StateStore): Promise<CsLinkAccountElem | undefined> => {
  try {
    const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
    if (!buf) return undefined;
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    if (address) return cs.link.find(v => v.type === type && v.id === id && v.address === bufferToHex(address));
    return cs.link.find(v => v.type === type && v.id === id);

  } catch (err) {
    return undefined;
  }
}

export const updateLinkAccount = async(type: string, id: string, address: Buffer, stateStore: StateStore): Promise<void> => {
  const buf = await stateStore.chain.get(CS_LINK_ACCOUNT);
  let data: CsLinkAccountElem[] = [];
  if (buf) {
    const cs = codec.decode<CsLinkAccount>(csLinkAccountSchema, buf);
    data = cs.link.filter(v => v.type !== type || v.id !== id);
  }
  data.push({type: type, id: id, address: bufferToHex(address)});
  await stateStore.chain.set(CS_LINK_ACCOUNT, codec.encode(csLinkAccountSchema, {link: data}));
}

export const getPendingTxBySenderIdAndAddress = async(type: string, contentType: string, senderId: string, address: Buffer, stateStore: StateStore): Promise<CsPendingTxElem | undefined> => {
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  if (!buf) return undefined;
  const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
  const data = cs.tx.find(v => {
    const contentAddress = v.content.address? v.content.address: "";
    return v.type === type && v.content.type === contentType && v.content.senderId === senderId && contentAddress === bufferToHex(address)
  });
  return data;
}

export const getPendingTxByTxId = async(type: string, txId: Buffer|null, stateStore: StateStore): Promise<CsPendingTxElem | undefined> => {
  if (!txId) return undefined;
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  if (!buf) return undefined;
  const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
  const data = cs.tx.find(v => {
    return v.type === type && v.id === bufferToHex(txId)
  });
  return data;
}

export const addPendingTxs = async(param: CsPendingTxElem, stateStore: StateStore): Promise<void> => {
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  let data: CsPendingTxElem[] = [];
  if (buf) data = codec.decode<CsPendingTx>(csPendingTxSchema, buf).tx;
  data.push(param);
  await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
}

export const removePendingTx = async(type: string, txId: Buffer|null, stateStore: StateStore): Promise<void> => {
  if (!txId) return;
  const buf = await stateStore.chain.get(CS_PENDING_TX);
  let data: CsPendingTxElem[] = [];
  if (buf) {
    const cs = codec.decode<CsPendingTx>(csPendingTxSchema, buf);
    data = cs.tx.filter(v => v.type !== type || v.id !== bufferToHex(txId));
  }
  await stateStore.chain.set(CS_PENDING_TX, codec.encode(csPendingTxSchema, {tx: data}));
}