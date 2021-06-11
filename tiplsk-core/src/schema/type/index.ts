export interface TipLskAccount {
	tiplsk: {
		link: {
			type: string;
			id: string;
		}[];
	}
}

export interface TxRegistration {
	readonly txId?: Buffer;
	readonly type: string;
	readonly senderId: string;
	readonly address: Buffer;
}

export interface TxTip {
	readonly txId?: Buffer;
	readonly type: string;
	readonly senderId: string;
	readonly recipientId: string;
	readonly recipientNm: string;
	readonly amount: bigint;
}

export interface CsLinkAccountElem {
	readonly type: string;
	readonly id: string;
	readonly address: Buffer;
}

export interface CsLinkAccount {
	readonly link: CsLinkAccountElem[];
}

export interface CsPendingTxElem {
	readonly type: string;
	readonly id: Buffer;
	readonly height: number;
	readonly expHeight: number;
	readonly content: {
		readonly type: string;
		readonly senderId: string;
		readonly recipientId?: string;
		readonly recipientNm?: string;
		readonly address?: Buffer;
		readonly amount?: string;
	};
}

export interface CsPendingTx {
	readonly tx: CsPendingTxElem[];
}