import type { CoinAsset } from '../entities/CoinAsset';

export interface IMarketRepository {
  getTopAssets(params: { isOnline: boolean; limit?: number }): Promise<CoinAsset[]>;
}
