export interface CommandResult {
	result: boolean;
	data?: string;
	message?: string;
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