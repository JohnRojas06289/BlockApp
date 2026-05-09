import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/db/client';
import { coinAssets, syncMetadata, type NewCoinAsset } from '@/src/shared/db/schema';
import type { CoinAsset } from '../../domain/entities/CoinAsset';

const RESOURCE_KEY = 'market:top10';

export async function getTopAssets(limit = 10): Promise<CoinAsset[]> {
  const rows = await db
    .select()
    .from(coinAssets)
    .orderBy(asc(coinAssets.marketCapRank))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    cachedAt: r.cachedAt instanceof Date ? r.cachedAt : new Date(r.cachedAt),
  }));
}

export async function upsertAssets(records: NewCoinAsset[]): Promise<void> {
  await db
    .insert(coinAssets)
    .values(records)
    .onConflictDoUpdate({
      target: coinAssets.id,
      set: {
        currentPrice: sql`excluded.current_price`,
        marketCap: sql`excluded.market_cap`,
        marketCapRank: sql`excluded.market_cap_rank`,
        priceChange24h: sql`excluded.price_change_24h`,
        priceChangePercentage24h: sql`excluded.price_change_percentage_24h`,
        high24h: sql`excluded.high_24h`,
        low24h: sql`excluded.low_24h`,
        totalVolume: sql`excluded.total_volume`,
        cachedAt: sql`excluded.cached_at`,
      },
    });
}

export async function isCacheStale(ttlMs: number): Promise<boolean> {
  const [meta] = await db
    .select()
    .from(syncMetadata)
    .where(eq(syncMetadata.resourceKey, RESOURCE_KEY));

  if (!meta) return true;

  const lastSync = meta.lastSyncedAt instanceof Date
    ? meta.lastSyncedAt.getTime()
    : (meta.lastSyncedAt as number) * 1000;

  return Date.now() - lastSync > ttlMs;
}

export async function markSynced(): Promise<void> {
  await db
    .insert(syncMetadata)
    .values({
      resourceKey: RESOURCE_KEY,
      lastSyncedAt: new Date(),
      ttlMs: 300_000,
      status: 'success',
    })
    .onConflictDoUpdate({
      target: syncMetadata.resourceKey,
      set: {
        lastSyncedAt: sql`excluded.last_synced_at`,
        status: sql`excluded.status`,
      },
    });
}
