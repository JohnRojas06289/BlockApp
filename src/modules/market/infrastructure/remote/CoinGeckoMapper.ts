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
    priceChangePercentage1h: dto.price_change_percentage_1h_in_currency ?? null,
    priceChangePercentage7d: dto.price_change_percentage_7d_in_currency ?? null,
    priceChangePercentage30d: dto.price_change_percentage_30d_in_currency ?? null,
    marketCapChangePercentage24h: dto.market_cap_change_percentage_24h ?? null,
    high24h: dto.high_24h ?? null,
    low24h: dto.low_24h ?? null,
    totalVolume: dto.total_volume ?? null,
    circulatingSupply: dto.circulating_supply ?? null,
    totalSupply: dto.total_supply ?? null,
    maxSupply: dto.max_supply ?? null,
    fullyDilutedValuation: dto.fully_diluted_valuation ?? null,
    ath: dto.ath ?? null,
    athChangePercentage: dto.ath_change_percentage ?? null,
    athDate: dto.ath_date ?? null,
    sparkline7d: dto.sparkline_in_7d?.price ?? [],
    lastUpdated: dto.last_updated ?? null,
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
    priceChangePercentage1h: entity.priceChangePercentage1h,
    priceChangePercentage7d: entity.priceChangePercentage7d,
    priceChangePercentage30d: entity.priceChangePercentage30d,
    marketCapChangePercentage24h: entity.marketCapChangePercentage24h,
    high24h: entity.high24h,
    low24h: entity.low24h,
    totalVolume: entity.totalVolume,
    circulatingSupply: entity.circulatingSupply,
    totalSupply: entity.totalSupply ?? null,
    maxSupply: entity.maxSupply ?? null,
    fullyDilutedValuation: entity.fullyDilutedValuation ?? null,
    ath: entity.ath ?? null,
    athChangePercentage: entity.athChangePercentage ?? null,
    athDate: entity.athDate ?? null,
    sparkline7d: JSON.stringify(entity.sparkline7d ?? []),
    lastUpdated: entity.lastUpdated ?? null,
    cachedAt: entity.cachedAt,
  };
}
