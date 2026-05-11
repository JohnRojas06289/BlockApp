// Web stub — sin persistencia local en web.
// isCacheStale=true garantiza que siempre se consulte la API si hay conexión.
import type { CoinAsset } from '../../domain/entities/CoinAsset';
import type { NewCoinAsset } from '@/src/shared/db/schema';

export async function getTopAssets(_limit = 10): Promise<CoinAsset[]> {
  return [];
}

export async function upsertAssets(_records: NewCoinAsset[]): Promise<void> {}

export async function isCacheStale(_limit: number, _ttlMs: number): Promise<boolean> {
  return true;
}

export async function markSynced(_limit: number): Promise<void> {}
