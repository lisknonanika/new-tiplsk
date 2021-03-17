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
	readonly amount: bigint;
}

export interface CsLinkAccountElem {
	readonly type: string;
	readonly id: string;
	readonly address: string;
}

export interface CsLinkAccount {
	readonly link: CsLinkAccountElem[];
}

export interface CsPendingTxElem {
	readonly type: string;
	readonly id: string;
	readonly height: string;
	readonly content: {
		readonly type: string;
		readonly senderId: string;
		readonly recipientId?: string;
		readonly address?: string;
		readonly amount?: string;
	};
}

export interface CsPendingTx {
	readonly tx: CsPendingTxElem[];
}