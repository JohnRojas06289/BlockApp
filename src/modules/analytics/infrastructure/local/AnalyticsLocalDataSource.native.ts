import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '@/src/shared/db/client';
import {
  assetHistoryPoints,
  syncMetadata,
  type NewAssetHistoryPoint,
} from '@/src/shared/db/schema';
import type {
  AssetHistoryDataset,
  ChartRange,
  HistoryMetric,
} from '../../application/usecases/buildAnalyticsDataset';

function resourceKey(assetId: string, range: ChartRange) {
  return `history:${assetId}:${range}`;
}

function emptyDataset(): AssetHistoryDataset {
  return { prices: [], marketCaps: [], totalVolumes: [] };
}

function latestCachedAt(records: Array<{ cachedAt: Date | number }>): Date | null {
  const raw = records[0]?.cachedAt;
  if (!raw) return null;
  return raw instanceof Date ? raw : new Date(raw);
}

export async function getAssetHistory(assetId: string, range: ChartRange): Promise<{
  dataset: AssetHistoryDataset;
  cachedAt: Date | null;
}> {
  const rows = await db
    .select()
    .from(assetHistoryPoints)
    .where(and(eq(assetHistoryPoints.assetId, assetId), eq(assetHistoryPoints.range, range)))
    .orderBy(asc(assetHistoryPoints.timestamp));

  if (rows.length === 0) {
    return { dataset: emptyDataset(), cachedAt: null };
  }

  const dataset: AssetHistoryDataset = { prices: [], marketCaps: [], totalVolumes: [] };

  rows.forEach((row) => {
    const tuple: [number, number] = [row.timestamp, row.value];

    if (row.metric === 'price') dataset.prices.push(tuple);
    if (row.metric === 'marketCap') dataset.marketCaps.push(tuple);
    if (row.metric === 'volume') dataset.totalVolumes.push(tuple);
  });

  return { dataset, cachedAt: latestCachedAt(rows) };
}

export async function replaceAssetHistory(params: {
  assetId: string;
  range: ChartRange;
  dataset: AssetHistoryDataset;
}): Promise<void> {
  await db
    .delete(assetHistoryPoints)
    .where(and(eq(assetHistoryPoints.assetId, params.assetId), eq(assetHistoryPoints.range, params.range)));

  const cachedAt = new Date();
  const records: NewAssetHistoryPoint[] = [];

  const pushMetric = (metric: HistoryMetric, values: number[][]) => {
    values.forEach(([timestamp, value]) => {
      records.push({
        assetId: params.assetId,
        range: params.range,
        metric,
        timestamp,
        value,
        cachedAt,
      });
    });
  };

  pushMetric('price', params.dataset.prices);
  pushMetric('marketCap', params.dataset.marketCaps);
  pushMetric('volume', params.dataset.totalVolumes);

  if (records.length > 0) {
    await db.insert(assetHistoryPoints).values(records);
  }
}

export async function isCacheStale(
  assetId: string,
  range: ChartRange,
  ttlMs: number,
): Promise<boolean> {
  const key = resourceKey(assetId, range);
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

export async function markSynced(assetId: string, range: ChartRange): Promise<void> {
  const key = resourceKey(assetId, range);

  await db
    .insert(syncMetadata)
    .values({
      resourceKey: key,
      lastSyncedAt: new Date(),
      ttlMs: 60 * 60 * 1000,
      status: 'success',
    })
    .onConflictDoUpdate({
      target: syncMetadata.resourceKey,
      set: {
        lastSyncedAt: sql`excluded.last_synced_at`,
        ttlMs: sql`excluded.ttl_ms`,
        status: sql`excluded.status`,
      },
    });
}
