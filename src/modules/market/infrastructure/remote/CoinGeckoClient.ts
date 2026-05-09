import axios from 'axios';
import { COINGECKO_BASE_URL, COINGECKO_API_KEY, TOP_COINS_LIMIT } from '@/src/shared/constants/api';

export interface CoinGeckoMarketDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  circulating_supply: number;
}

const client = axios.create({
  baseURL: COINGECKO_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    // Demo key usa x-cg-demo-api-key; Pro key usa x-cg-pro-api-key
    ...(COINGECKO_API_KEY && { 'x-cg-demo-api-key': COINGECKO_API_KEY }),
  },
});

export async function fetchTopCoins(limit = TOP_COINS_LIMIT): Promise<CoinGeckoMarketDto[]> {
  const { data } = await client.get<CoinGeckoMarketDto[]>('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
  });
  return data;
}
