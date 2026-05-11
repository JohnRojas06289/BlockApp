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
  priceChangePercentage1h: number | null;
  priceChangePercentage7d: number | null;
  priceChangePercentage30d: number | null;
  marketCapChangePercentage24h: number | null;
  high24h: number | null;
  low24h: number | null;
  totalVolume: number | null;
  circulatingSupply: number | null;
  totalSupply?: number | null;
  maxSupply?: number | null;
  fullyDilutedValuation?: number | null;
  ath?: number | null;
  athChangePercentage?: number | null;
  athDate?: string | null;
  sparkline7d?: number[];
  lastUpdated?: string | null;
  cachedAt: Date;
}
