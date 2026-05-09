export interface Transaction {
  hash: string;
  walletAddress: string;
  blockchain: string;
  blockNumber: number | null;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  fromAddress: string | null;
  toAddress: string | null;
  valueNative: string;
  valueUsd: number | null;
  feeNative: string | null;
  feeUsd: number | null;
  status: 'confirmed' | 'pending' | 'failed';
  cachedAt: Date;
}
