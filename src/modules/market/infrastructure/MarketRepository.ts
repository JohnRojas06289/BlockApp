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

    const isStale = await local.isCacheStale(MARKET_CACHE_TTL_MS);
    if (!isStale) {
      return local.getTopAssets(limit);
    }

    try {
      const dtos = await fetchTopCoins(limit);
      const entities = dtos.map(toEntity);
      await local.upsertAssets(entities.map(toDbRecord));
      await local.markSynced();
      return entities;
    } catch (error: unknown) {
      // 401 = key inválida o expirada — lo propagamos para que la UI lo muestre
      if (isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid CoinGecko API key. Check your EXPO_PUBLIC_COINGECKO_API_KEY.');
      }
      // Cualquier otro error (red, timeout): degradación elegante al cache
      return local.getTopAssets(limit);
    }
  }
}

// Singleton — una sola instancia en toda la app
export const marketRepository = new MarketRepository();
