export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
export const BLOCKCHAIR_BASE_URL = 'https://api.blockchair.com';

// En Expo, EXPO_PUBLIC_* se expone al bundle del cliente en build time
export const COINGECKO_API_KEY = process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';
export const BLOCKCHAIR_API_KEY = process.env.EXPO_PUBLIC_BLOCKCHAIR_API_KEY ?? '';

export const MARKET_CACHE_TTL_MS = 5 * 60 * 1000;   // 5 minutes
export const WALLET_CACHE_TTL_MS = 10 * 60 * 1000;  // 10 minutes

export const TOP_COINS_LIMIT = 10;
export const TRANSACTIONS_PER_PAGE = 25;
