// Web stub — sin persistencia local en web.
import type { WalletBalance, Blockchain } from '../../domain/entities/WalletBalance';
import type { Transaction } from '../../domain/entities/Transaction';
import type { NewWalletAddress, NewWalletTransaction } from '@/src/shared/db/schema';

export async function getWalletBalance(_address: string): Promise<WalletBalance | null> {
  return null;
}

export async function upsertWalletAddress(_record: NewWalletAddress): Promise<void> {}

export async function getAllWallets(): Promise<WalletBalance[]> {
  return [];
}

export async function getTransactions(_address: string): Promise<Transaction[]> {
  return [];
}

export async function upsertTransactions(_records: NewWalletTransaction[]): Promise<void> {}

export async function isCacheStale(_address: string, _ttlMs: number): Promise<boolean> {
  return true;
}

export async function markSynced(_address: string): Promise<void> {}
