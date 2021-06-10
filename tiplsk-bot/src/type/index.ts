export interface CommandResult {
	result: boolean;
	data: string;
}

export interface Registration extends Record<string, unknown> {
	type: string;
	senderId: string;
	address: Buffer;
}

export interface Tip extends Record<string, unknown> {
	type: string;
	senderId: string;
	recipientId: string;
	recipientNm: string;
	amount: bigint;
}

export interface LinkAccountElem {
	readonly type: string;
	readonly id: string;
	readonly address: string;
}

export interface LinkAccount {
	readonly link: LinkAccountElem[];
}