export interface CoinAsset {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  currentPrice: number;
  marketCap: number | null;
  marketCapRank: number | null;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  high24h: number | null;
  low24h: number | null;
  totalVolume: number | null;
  circulatingSupply: number | null;
  cachedAt: Date;
}
