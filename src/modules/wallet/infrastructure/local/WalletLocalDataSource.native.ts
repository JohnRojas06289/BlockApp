import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/db/client';
import {
  walletAddresses,
  walletTransactions,
  syncMetadata,
  type NewWalletAddress,
  type NewWalletTransaction,
} from '@/src/shared/db/schema';
import type { WalletBalance, Blockchain } from '../../domain/entities/WalletBalance';
import type { Transaction } from '../../domain/entities/Transaction';

function resourceKey(address: string) {
  return `wallet:${address.toLowerCase()}`;
}

// ─── Wallet balance ─────────────────────────────────────────────────────────

export async function getWalletBalance(address: string): Promise<WalletBalance | null> {
  const [row] = await db
    .select()
    .from(walletAddresses)
    .where(eq(walletAddresses.address, address));

  if (!row) return null;

  return {
    address: row.address,
    blockchain: row.blockchain as Blockchain,
    label: row.label,
    balanceNative: row.balanceNative,
    balanceUsd: row.balanceUsd,
    totalReceived: row.totalReceived,
    totalSent: row.totalSent,
    transactionCount: row.transactionCount,
    cachedAt: row.cachedAt instanceof Date ? row.cachedAt : new Date(row.cachedAt),
  };
}

export async function upsertWalletAddress(record: NewWalletAddress): Promise<void> {
  await db
    .insert(walletAddresses)
    .values(record)
    .onConflictDoUpdate({
      target: walletAddresses.address,
      set: {
        balanceNative: sql`excluded.balance_native`,
        balanceUsd: sql`excluded.balance_usd`,
        totalReceived: sql`excluded.total_received`,
        totalSent: sql`excluded.total_sent`,
        transactionCount: sql`excluded.transaction_count`,
        cachedAt: sql`excluded.cached_at`,
      },
    });
}

export async function getAllWallets(): Promise<WalletBalance[]> {
  const rows = await db.select().from(walletAddresses);
  return rows.map((row) => ({
    address: row.address,
    blockchain: row.blockchain as Blockchain,
    label: row.label,
    balanceNative: row.balanceNative,
    balanceUsd: row.balanceUsd,
    totalReceived: row.totalReceived,
    totalSent: row.totalSent,
    transactionCount: row.transactionCount,
    cachedAt: row.cachedAt instanceof Date ? row.cachedAt : new Date(row.cachedAt),
  }));
}

// ─── Transactions ──────────────────────────────────────────────────────────

export async function getTransactions(address: string): Promise<Transaction[]> {
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.walletAddress, address))
    .orderBy(desc(walletTransactions.timestamp));

  return rows.map((r) => ({
    hash: r.hash,
    walletAddress: r.walletAddress,
    blockchain: r.blockchain,
    blockNumber: r.blockNumber,
    timestamp: r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp),
    direction: r.direction as 'incoming' | 'outgoing',
    fromAddress: r.fromAddress,
    toAddress: r.toAddress,
    valueNative: r.valueNative,
    valueUsd: r.valueUsd,
    feeNative: r.feeNative,
    feeUsd: r.feeUsd,
    status: r.status as 'confirmed' | 'pending' | 'failed',
    cachedAt: r.cachedAt instanceof Date ? r.cachedAt : new Date(r.cachedAt),
  }));
}

export async function upsertTransactions(records: NewWalletTransaction[]): Promise<void> {
  if (records.length === 0) return;

  await db
    .insert(walletTransactions)
    .values(records)
    .onConflictDoUpdate({
      target: walletTransactions.hash,
      set: {
        status: sql`excluded.status`,
        cachedAt: sql`excluded.cached_at`,
      },
    });
}

// ─── Sync control ──────────────────────────────────────────────────────────

export async function isCacheStale(address: string, ttlMs: number): Promise<boolean> {
  const key = resourceKey(address);
  const [meta] = await db
    .select()
    .from(syncMetadata)
    .where(eq(syncMetadata.resourceKey, key));

  if (!meta) return true;

  const lastSync = meta.lastSyncedAt instanceof Date
    ? meta.lastSyncedAt.getTime()
    : (meta.lastSyncedAt as number) * 1000;

  return Date.now() - lastSync > ttlMs;
}

export async function markSynced(address: string): Promise<void> {
  const key = resourceKey(address);
  await db
    .insert(syncMetadata)
    .values({ resourceKey: key, lastSyncedAt: new Date(), ttlMs: 600_000, status: 'success' })
    .onConflictDoUpdate({
      target: syncMetadata.resourceKey,
      set: {
        lastSyncedAt: sql`excluded.last_synced_at`,
        status: sql`excluded.status`,
      },
    });
}
