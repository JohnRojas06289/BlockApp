import type { CoinGeckoMarketDto } from './CoinGeckoClient';
import type { CoinAsset } from '../../domain/entities/CoinAsset';
import type { NewCoinAsset } from '@/src/shared/db/schema';

export function toEntity(dto: CoinGeckoMarketDto): CoinAsset {
  return {
    id: dto.id,
    symbol: dto.symbol.toUpperCase(),
    name: dto.name,
    image: dto.image ?? null,
    currentPrice: dto.current_price,
    marketCap: dto.market_cap ?? null,
    marketCapRank: dto.market_cap_rank ?? null,
    priceChange24h: dto.price_change_24h ?? null,
    priceChangePercentage24h: dto.price_change_percentage_24h ?? null,
    high24h: dto.high_24h ?? null,
    low24h: dto.low_24h ?? null,
    totalVolume: dto.total_volume ?? null,
    circulatingSupply: dto.circulating_supply ?? null,
    cachedAt: new Date(),
  };
}

export function toDbRecord(entity: CoinAsset): NewCoinAsset {
  return {
    id: entity.id,
    symbol: entity.symbol,
    name: entity.name,
    image: entity.image,
    currentPrice: entity.currentPrice,
    marketCap: entity.marketCap,
    marketCapRank: entity.marketCapRank,
    priceChange24h: entity.priceChange24h,
    priceChangePercentage24h: entity.priceChangePercentage24h,
    high24h: entity.high24h,
    low24h: entity.low24h,
    totalVolume: entity.totalVolume,
    circulatingSupply: entity.circulatingSupply,
    cachedAt: entity.cachedAt,
  };
}
