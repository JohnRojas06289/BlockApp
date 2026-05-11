import type { CoinAsset } from '@/src/modules/market/domain/entities/CoinAsset';

export type ChartRange = '7D' | '30D' | '90D';
export type TrendFilter = 'all' | 'leaders' | 'momentum' | 'reversal';
export type CapFilter = 'all' | 'large' | 'mid' | 'small';
export type SortBy = 'conviction' | 'marketCap' | 'liquidity' | 'athGap';
export type CapTier = Exclude<CapFilter, 'all'>;
export type HistoryMetric = 'price' | 'marketCap' | 'volume';
export type SetupLabel = 'Leader' | 'Momentum' | 'Reversal' | 'Watch';

export interface HistoricalPoint {
  label: string;
  value: number;
  timestamp?: number;
}

export interface AssetHistoryDataset {
  prices: number[][];
  marketCaps: number[][];
  totalVolumes: number[][];
}

export interface AssetHistoryResult {
  dataset: AssetHistoryDataset;
  source: 'live' | 'cache';
  cachedAt: Date | null;
}

export interface AnalyticsAsset extends CoinAsset {
  capTier: CapTier;
  sparkline: HistoricalPoint[];
  volatility7d: number;
  liquidityRatio: number | null;
  distanceToAth: number | null;
  supplyProgress: number | null;
  dominance: number;
  conviction: number;
  setup: SetupLabel;
  insight: string;
}

export interface MarketPulse {
  breadth24h: number;
  average24h: number;
  average7d: number;
  average30d: number;
  volumeToCap: number;
  totalMarketCap: number;
  regime: string;
  note: string;
  leader: AnalyticsAsset | null;
  reversal: AnalyticsAsset | null;
}

const CHART_DAYS: Record<ChartRange, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCapTier(marketCap: number | null): CapTier {
  if (marketCap !== null && marketCap >= 10_000_000_000) return 'large';
  if (marketCap !== null && marketCap >= 1_000_000_000) return 'mid';
  return 'small';
}

function computeVolatility(values: number[]): number {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min <= 0) return 0;
  return ((max - min) / min) * 100;
}

function buildSparkline(prices: number[] | undefined): HistoricalPoint[] {
  if (!prices?.length) return [];

  const lastIndex = prices.length - 1;

  return prices.map((value, index) => ({
    label: index === lastIndex ? 'Now' : `D${index + 1}`,
    value,
  }));
}

function computeSupplyProgress(asset: CoinAsset): number | null {
  const denominator = asset.maxSupply ?? asset.totalSupply ?? null;
  if (!denominator || !asset.circulatingSupply || denominator <= 0) return null;
  return clamp((asset.circulatingSupply / denominator) * 100, 0, 100);
}

function computeSetup(
  asset: CoinAsset,
  volatility7d: number,
  liquidityRatio: number | null,
): SetupLabel {
  const change24h = asset.priceChangePercentage24h ?? 0;
  const change7d = asset.priceChangePercentage7d ?? 0;
  const change30d = asset.priceChangePercentage30d ?? 0;

  if ((asset.marketCapRank ?? 999) <= 3 && change30d >= 0 && volatility7d < 18) {
    return 'Leader';
  }

  if (change24h > 0 && change7d > 0 && change30d > 0 && (liquidityRatio ?? 0) >= 4) {
    return 'Momentum';
  }

  if (change24h > 0 && change7d < 0) {
    return 'Reversal';
  }

  return 'Watch';
}

function buildInsight(setup: SetupLabel, asset: CoinAsset, liquidityRatio: number | null): string {
  switch (setup) {
    case 'Leader':
      return 'Large cap with positive trend and relatively controlled volatility.';
    case 'Momentum':
      return 'Strength is aligned across multiple windows and supported by active volume.';
    case 'Reversal':
      return 'Short-term buyers are stepping in after a softer weekly trend.';
    default:
      if ((asset.athChangePercentage ?? -100) > -15) {
        return 'Trading close to its highs, but still needs confirmation.';
      }
      if ((liquidityRatio ?? 0) >= 5) {
        return 'Liquidity is healthy enough to keep it on the radar.';
      }
      return 'Useful for watchlist context, but not yet a clear setup.';
  }
}

function computeConviction(
  asset: CoinAsset,
  volatility7d: number,
  liquidityRatio: number | null,
): number {
  const hourly = asset.priceChangePercentage1h ?? 0;
  const daily = asset.priceChangePercentage24h ?? 0;
  const weekly = asset.priceChangePercentage7d ?? 0;
  const monthly = asset.priceChangePercentage30d ?? 0;
  const athGap = asset.athChangePercentage ?? -35;
  const liquidityBoost = liquidityRatio === null ? 0 : clamp(liquidityRatio * 4, 0, 18);
  const athBoost = clamp(25 + athGap, 0, 25);
  const volatilityPenalty = clamp(volatility7d - 16, 0, 24) * 0.9;

  return clamp(
    48 +
      hourly * 0.8 +
      daily * 1.2 +
      weekly * 1 +
      monthly * 0.55 +
      liquidityBoost +
      athBoost -
      volatilityPenalty,
    0,
    100,
  );
}

export function buildAnalyticsAssets(assets: CoinAsset[]): AnalyticsAsset[] {
  const totalMarketCap = assets.reduce((sum, asset) => sum + (asset.marketCap ?? 0), 0) || 1;

  return assets.map((asset) => {
    const sparkline = buildSparkline(asset.sparkline7d);
    const sparklineValues = sparkline.map((point) => point.value);
    const volatility7d = computeVolatility(sparklineValues);
    const liquidityRatio =
      asset.marketCap && asset.totalVolume
        ? (asset.totalVolume / asset.marketCap) * 100
        : null;
    const setup = computeSetup(asset, volatility7d, liquidityRatio);

    return {
      ...asset,
      capTier: getCapTier(asset.marketCap),
      sparkline,
      volatility7d,
      liquidityRatio,
      distanceToAth: asset.athChangePercentage ?? null,
      supplyProgress: computeSupplyProgress(asset),
      dominance: ((asset.marketCap ?? 0) / totalMarketCap) * 100,
      conviction: computeConviction(asset, volatility7d, liquidityRatio),
      setup,
      insight: buildInsight(setup, asset, liquidityRatio),
    };
  });
}

export function buildMarketPulse(assets: AnalyticsAsset[]): MarketPulse {
  const positive24h = assets.filter((asset) => (asset.priceChangePercentage24h ?? 0) >= 0).length;
  const breadth24h = assets.length === 0 ? 0 : (positive24h / assets.length) * 100;
  const average24h = average(
    assets.map((asset) => asset.priceChangePercentage24h ?? 0),
  );
  const average7d = average(
    assets.map((asset) => asset.priceChangePercentage7d ?? 0),
  );
  const average30d = average(
    assets.map((asset) => asset.priceChangePercentage30d ?? 0),
  );
  const totalMarketCap = assets.reduce((sum, asset) => sum + (asset.marketCap ?? 0), 0);
  const totalVolume = assets.reduce((sum, asset) => sum + (asset.totalVolume ?? 0), 0);
  const volumeToCap = totalMarketCap > 0 ? (totalVolume / totalMarketCap) * 100 : 0;

  let regime = 'Rotation';
  let note = 'Capital is moving between names instead of lifting everything at once.';

  if (breadth24h >= 65 && average7d > 0 && average30d > 0) {
    regime = 'Risk On';
    note = 'Broad participation and positive medium-term trend across the tracked set.';
  } else if (breadth24h >= 50 && average24h > 0 && average30d <= 0) {
    regime = 'Recovery';
    note = 'Short-term strength is improving, but the longer trend still needs follow-through.';
  } else if (breadth24h < 40 && average7d < 0) {
    regime = 'Risk Off';
    note = 'Weak breadth and negative weekly trend suggest a more defensive tape.';
  }

  const leader =
    [...assets].sort((left, right) => right.conviction - left.conviction)[0] ?? null;
  const reversal =
    [...assets]
      .filter((asset) => asset.setup === 'Reversal')
      .sort(
        (left, right) =>
          (right.priceChangePercentage24h ?? 0) - (left.priceChangePercentage24h ?? 0),
      )[0] ?? null;

  return {
    breadth24h,
    average24h,
    average7d,
    average30d,
    volumeToCap,
    totalMarketCap,
    regime,
    note,
    leader,
    reversal,
  };
}

export function buildHistoryPoints(
  dataset: AssetHistoryDataset,
  metric: HistoryMetric,
  range: ChartRange,
): HistoricalPoint[] {
  const series =
    metric === 'price'
      ? dataset.prices
      : metric === 'marketCap'
        ? dataset.marketCaps
        : dataset.totalVolumes;

  if (!series.length) return [];

  const targetPoints = range === '7D' ? 14 : range === '30D' ? 16 : 18;
  const stride = Math.max(1, Math.floor(series.length / targetPoints));
  const sampled = series.filter((_, index) => index % stride === 0);
  const sliced = sampled.slice(-targetPoints);

  return sliced.map(([timestamp, value], index) => ({
    timestamp,
    value,
    label: formatChartLabel(timestamp, range, index === sliced.length - 1),
  }));
}

function formatChartLabel(timestamp: number, range: ChartRange, isLast: boolean): string {
  if (isLast) return 'Now';

  const date = new Date(timestamp);

  if (range === '7D') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  if (range === '30D') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function mapChartRangeToDays(range: ChartRange): number {
  return CHART_DAYS[range];
}

export function pickFeaturedAssets(assets: AnalyticsAsset[]): AnalyticsAsset[] {
  return [...assets]
    .sort((left, right) => right.conviction - left.conviction)
    .slice(0, 3);
}
