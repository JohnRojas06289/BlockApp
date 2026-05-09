export type Blockchain = 'bitcoin' | 'ethereum' | 'solana';

export interface WalletBalance {
  address: string;
  blockchain: Blockchain;
  label: string | null;
  balanceNative: string | null;
  balanceUsd: number | null;
  totalReceived: string | null;
  totalSent: string | null;
  transactionCount: number | null;
  cachedAt: Date;
}
