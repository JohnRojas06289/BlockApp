import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─────────────────────────────────────────────
// MARKET MODULE
// ─────────────────────────────────────────────

export const coinAssets = sqliteTable(
  'coin_assets',
  {
    id: text('id').primaryKey(),                             // 'bitcoin', 'ethereum'
    symbol: text('symbol').notNull(),                        // 'BTC'
    name: text('name').notNull(),                            // 'Bitcoin'
    image: text('image'),
    currentPrice: real('current_price').notNull(),
    marketCap: real('market_cap'),
    marketCapRank: integer('market_cap_rank'),
    priceChange24h: real('price_change_24h'),
    priceChangePercentage24h: real('price_change_percentage_24h'),
    priceChangePercentage1h: real('price_change_percentage_1h'),
    priceChangePercentage7d: real('price_change_percentage_7d'),
    priceChangePercentage30d: real('price_change_percentage_30d'),
    marketCapChangePercentage24h: real('market_cap_change_percentage_24h'),
    high24h: real('high_24h'),
    low24h: real('low_24h'),
    totalVolume: real('total_volume'),
    circulatingSupply: real('circulating_supply'),
    totalSupply: real('total_supply'),
    maxSupply: real('max_supply'),
    fullyDilutedValuation: real('fully_diluted_valuation'),
    ath: real('ath'),
    athChangePercentage: real('ath_change_percentage'),
    athDate: text('ath_date'),
    sparkline7d: text('sparkline_7d'),
    lastUpdated: text('last_updated'),
    cachedAt: integer('cached_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index('coin_rank_idx').on(t.marketCapRank),
  ],
);

export const assetHistoryPoints = sqliteTable(
  'asset_history_points',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    assetId: text('asset_id').notNull().references(() => coinAssets.id, { onDelete: 'cascade' }),
    range: text('range').notNull(),
    metric: text('metric').notNull(),
    timestamp: integer('timestamp').notNull(),
    value: real('value').notNull(),
    cachedAt: integer('cached_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index('history_asset_idx').on(t.assetId),
    index('history_asset_range_metric_idx').on(t.assetId, t.range, t.metric),
    index('history_asset_timestamp_idx').on(t.assetId, t.timestamp),
  ],
);

// ─────────────────────────────────────────────
// WALLET MODULE
// ─────────────────────────────────────────────

export const walletAddresses = sqliteTable('wallet_addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  address: text('address').notNull().unique(),
  blockchain: text('blockchain').notNull(),                  // 'bitcoin' | 'ethereum' | 'solana'
  label: text('label'),
  // String: evita pérdida de precisión en satoshis/wei
  balanceNative: text('balance_native'),
  balanceUsd: real('balance_usd'),
  totalReceived: text('total_received'),
  totalSent: text('total_sent'),
  transactionCount: integer('transaction_count'),
  cachedAt: integer('cached_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const walletTransactions = sqliteTable(
  'wallet_transactions',
  {
    hash: text('hash').primaryKey(),
    walletAddress: text('wallet_address')
      .notNull()
      .references(() => walletAddresses.address, { onDelete: 'cascade' }),
    blockchain: text('blockchain').notNull(),
    blockNumber: integer('block_number'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    direction: text('direction').notNull(),                  // 'incoming' | 'outgoing'
    fromAddress: text('from_address'),
    toAddress: text('to_address'),
    valueNative: text('value_native').notNull(),
    valueUsd: real('value_usd'),
    feeNative: text('fee_native'),
    feeUsd: real('fee_usd'),
    status: text('status').notNull(),                        // 'confirmed' | 'pending' | 'failed'
    cachedAt: integer('cached_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index('tx_wallet_idx').on(t.walletAddress),
    index('tx_timestamp_idx').on(t.timestamp),
    index('tx_wallet_timestamp_idx').on(t.walletAddress, t.timestamp),
  ],
);

// ─────────────────────────────────────────────
// SYNC CONTROL
// ─────────────────────────────────────────────

export const syncMetadata = sqliteTable('sync_metadata', {
  resourceKey: text('resource_key').primaryKey(),           // 'market:top10' | 'wallet:0x...'
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }).notNull(),
  ttlMs: integer('ttl_ms').notNull().default(300_000),
  status: text('status').notNull().default('success'),      // 'success' | 'error'
});

// ─────────────────────────────────────────────
// INFERRED TYPES — úsalos en el dominio
// ─────────────────────────────────────────────

export type CoinAsset = typeof coinAssets.$inferSelect;
export type NewCoinAsset = typeof coinAssets.$inferInsert;
export type WalletAddress = typeof walletAddresses.$inferSelect;
export type NewWalletAddress = typeof walletAddresses.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
export type SyncMetadata = typeof syncMetadata.$inferSelect;
export type AssetHistoryPoint = typeof assetHistoryPoints.$inferSelect;
export type NewAssetHistoryPoint = typeof assetHistoryPoints.$inferInsert;
