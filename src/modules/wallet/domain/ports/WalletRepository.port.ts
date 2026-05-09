import type { Blockchain, WalletBalance } from '../entities/WalletBalance';
import type { Transaction } from '../entities/Transaction';

export interface AuditResult {
  balance: WalletBalance;
  transactions: Transaction[];
}

export interface IWalletRepository {
  auditWallet(params: {
    address: string;
    blockchain: Blockchain;
    isOnline: boolean;
  }): Promise<AuditResult>;

  getSavedAddresses(): Promise<WalletBalance[]>;
}
