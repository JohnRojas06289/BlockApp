import axios from 'axios';
import { COINGECKO_BASE_URL, COINGECKO_API_KEY, TOP_COINS_LIMIT } from '@/src/shared/constants/api';

export interface CoinGeckoMarketDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
  market_cap_change_percentage_24h?: number | null;
  circulating_supply: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  last_updated?: string | null;
  sparkline_in_7d?: {
    price?: number[];
  };
}

export interface CoinGeckoMarketChartDto {
  prices: number[][];
  market_caps: number[][];
  total_volumes: number[][];
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
      sparkline: true,
      price_change_percentage: '1h,24h,7d,30d',
      precision: 'full',
    },
  });
  return data;
}

export async function fetchCoinMarketChart(
  id: string,
  days: number,
): Promise<CoinGeckoMarketChartDto> {
  const { data } = await client.get<CoinGeckoMarketChartDto>(`/coins/${id}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days,
      interval: days <= 90 ? 'hourly' : 'daily',
      precision: 'full',
    },
  });

  return data;
}
