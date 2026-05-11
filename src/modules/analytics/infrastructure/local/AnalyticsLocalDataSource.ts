import type {
  AssetHistoryDataset,
  ChartRange,
} from '../../application/usecases/buildAnalyticsDataset';

function emptyDataset(): AssetHistoryDataset {
  return { prices: [], marketCaps: [], totalVolumes: [] };
}

export async function getAssetHistory(_assetId: string, _range: ChartRange): Promise<{
  dataset: AssetHistoryDataset;
  cachedAt: Date | null;
}> {
  return { dataset: emptyDataset(), cachedAt: null };
}

export async function replaceAssetHistory(_params: {
  assetId: string;
  range: ChartRange;
  dataset: AssetHistoryDataset;
}): Promise<void> {}

export async function isCacheStale(
  _assetId: string,
  _range: ChartRange,
  _ttlMs: number,
): Promise<boolean> {
  return true;
}

export async function markSynced(_assetId: string, _range: ChartRange): Promise<void> {}
