import { isAxiosError } from 'axios';
import {
  fetchCoinMarketChart,
  type CoinGeckoMarketChartDto,
} from '@/src/modules/market/infrastructure/remote/CoinGeckoClient';
import { HISTORY_CACHE_TTL_MS } from '@/src/shared/constants/api';
import {
  mapChartRangeToDays,
  type AssetHistoryDataset,
  type AssetHistoryResult,
  type ChartRange,
} from '../application/usecases/buildAnalyticsDataset';
import * as local from './local/AnalyticsLocalDataSource';

class AnalyticsRepository {
  async getAssetHistory(params: {
    assetId: string;
    range: ChartRange;
    isOnline: boolean;
  }): Promise<AssetHistoryResult> {
    if (!params.isOnline) {
      const cached = await local.getAssetHistory(params.assetId, params.range);
      return { dataset: cached.dataset, source: 'cache', cachedAt: cached.cachedAt };
    }

    const isStale = await local.isCacheStale(
      params.assetId,
      params.range,
      HISTORY_CACHE_TTL_MS,
    );

    if (!isStale) {
      const cached = await local.getAssetHistory(params.assetId, params.range);
      if (this.hasHistory(cached.dataset)) {
        return { dataset: cached.dataset, source: 'cache', cachedAt: cached.cachedAt };
      }
    }

    const days = mapChartRangeToDays(params.range);

    try {
      const data = await fetchCoinMarketChart(params.assetId, days);
      const dataset = this.toHistoryDataset(data);
      await local.replaceAssetHistory({
        assetId: params.assetId,
        range: params.range,
        dataset,
      });
      await local.markSynced(params.assetId, params.range);

      return { dataset, source: 'live', cachedAt: new Date() };
    } catch (error: unknown) {
      const cached = await local.getAssetHistory(params.assetId, params.range);

      if (this.hasHistory(cached.dataset)) {
        return { dataset: cached.dataset, source: 'cache', cachedAt: cached.cachedAt };
      }

      if (isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid CoinGecko API key for historical analytics.');
      }

      if (isAxiosError(error) && error.response?.status === 429) {
        throw new Error('CoinGecko rate limit reached while loading historical analytics.');
      }

      throw new Error('Unable to load historical analytics for this asset right now.');
    }
  }

  private toHistoryDataset(data: CoinGeckoMarketChartDto): AssetHistoryDataset {
    return {
      prices: data.prices ?? [],
      marketCaps: data.market_caps ?? [],
      totalVolumes: data.total_volumes ?? [],
    };
  }

  private hasHistory(dataset: AssetHistoryDataset): boolean {
    return dataset.prices.length > 0 || dataset.marketCaps.length > 0 || dataset.totalVolumes.length > 0;
  }
}

export const analyticsRepository = new AnalyticsRepository();
