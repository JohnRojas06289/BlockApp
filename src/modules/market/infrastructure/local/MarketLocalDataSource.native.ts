import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/db/client';
import { coinAssets, syncMetadata, type NewCoinAsset } from '@/src/shared/db/schema';
import type { CoinAsset } from '../../domain/entities/CoinAsset';

function resourceKey(limit: number) {
  return `market:top:${limit}`;
}

function parseSparkline(raw: string | null): number[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'number') : [];
  } catch {
    return [];
  }
}

export async function getTopAssets(limit = 10): Promise<CoinAsset[]> {
  const rows = await db
    .select()
    .from(coinAssets)
    .orderBy(asc(coinAssets.marketCapRank))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    sparkline7d: parseSparkline(r.sparkline7d),
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
        priceChangePercentage1h: sql`excluded.price_change_percentage_1h`,
        priceChangePercentage7d: sql`excluded.price_change_percentage_7d`,
        priceChangePercentage30d: sql`excluded.price_change_percentage_30d`,
        marketCapChangePercentage24h: sql`excluded.market_cap_change_percentage_24h`,
        high24h: sql`excluded.high_24h`,
        low24h: sql`excluded.low_24h`,
        totalVolume: sql`excluded.total_volume`,
        circulatingSupply: sql`excluded.circulating_supply`,
        totalSupply: sql`excluded.total_supply`,
        maxSupply: sql`excluded.max_supply`,
        fullyDilutedValuation: sql`excluded.fully_diluted_valuation`,
        ath: sql`excluded.ath`,
        athChangePercentage: sql`excluded.ath_change_percentage`,
        athDate: sql`excluded.ath_date`,
        sparkline7d: sql`excluded.sparkline_7d`,
        lastUpdated: sql`excluded.last_updated`,
        cachedAt: sql`excluded.cached_at`,
      },
    });
}

export async function isCacheStale(limit: number, ttlMs: number): Promise<boolean> {
  const [meta] = await db
    .select()
    .from(syncMetadata)
    .where(eq(syncMetadata.resourceKey, resourceKey(limit)));

  if (!meta) return true;

  const lastSync = meta.lastSyncedAt instanceof Date
    ? meta.lastSyncedAt.getTime()
    : (meta.lastSyncedAt as number) * 1000;

  return Date.now() - lastSync > ttlMs;
}

export async function markSynced(limit: number): Promise<void> {
  await db
    .insert(syncMetadata)
    .values({
      resourceKey: resourceKey(limit),
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
