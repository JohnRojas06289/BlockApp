import { isAxiosError } from 'axios';
import type { IMarketRepository } from '../domain/ports/MarketRepository.port';
import type { CoinAsset } from '../domain/entities/CoinAsset';
import { fetchTopCoins } from './remote/CoinGeckoClient';
import { toEntity, toDbRecord } from './remote/CoinGeckoMapper';
import * as local from './local/MarketLocalDataSource';
import { MARKET_CACHE_TTL_MS } from '@/src/shared/constants/api';

class MarketRepository implements IMarketRepository {
  async getTopAssets({ isOnline, limit = 10 }: { isOnline: boolean; limit?: number }): Promise<CoinAsset[]> {
    if (!isOnline) {
      return local.getTopAssets(limit);
    }

    const isStale = await local.isCacheStale(limit, MARKET_CACHE_TTL_MS);
    if (!isStale) {
      return local.getTopAssets(limit);
    }

    try {
      const dtos = await fetchTopCoins(limit);
      const entities = dtos.map(toEntity);
      await local.upsertAssets(entities.map(toDbRecord));
      await local.markSynced(limit);
      return entities;
    } catch (error: unknown) {
      const cached = await local.getTopAssets(limit);

      if (cached.length > 0) {
        return cached;
      }

      // 401 = key inválida o expirada — lo propagamos para que la UI lo muestre
      if (isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid CoinGecko API key. Check your EXPO_PUBLIC_COINGECKO_API_KEY.');
      }

      if (isAxiosError(error) && error.response?.status === 429) {
        throw new Error('CoinGecko rate limit reached. Try again in a moment.');
      }

      throw new Error('Unable to load market data right now.');
    }
  }
}

// Singleton — una sola instancia en toda la app
export const marketRepository = new MarketRepository();
