import type { CoinAsset } from '../../domain/entities/CoinAsset';

export interface ComparisonMetric {
  label: string;
  valueA: string;
  valueB: string;
  winner: 'a' | 'b' | 'tie' | 'none'; // 'none' cuando no aplica comparación
}

export interface AssetsComparison {
  assetA: CoinAsset;
  assetB: CoinAsset;
  metrics: ComparisonMetric[];
}

function fmtUsd(value: number | null, decimals = 2): string {
  if (value === null) return '—';
  if (value >= 1_000_000_000_000) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals });
}

function fmtPct(value: number | null): string {
  if (value === null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function numWinner(a: number | null, b: number | null, higherIsBetter = true): 'a' | 'b' | 'tie' | 'none' {
  if (a === null || b === null) return 'none';
  if (a === b) return 'tie';
  return higherIsBetter ? (a > b ? 'a' : 'b') : (a < b ? 'a' : 'b');
}

export function compareAssets(assetA: CoinAsset, assetB: CoinAsset): AssetsComparison {
  const metrics: ComparisonMetric[] = [
    {
      label: 'Price',
      valueA: fmtUsd(assetA.currentPrice, 4),
      valueB: fmtUsd(assetB.currentPrice, 4),
      winner: 'none',
    },
    {
      label: '24h Change',
      valueA: fmtPct(assetA.priceChangePercentage24h),
      valueB: fmtPct(assetB.priceChangePercentage24h),
      winner: numWinner(assetA.priceChangePercentage24h, assetB.priceChangePercentage24h),
    },
    {
      label: 'Market Cap',
      valueA: fmtUsd(assetA.marketCap),
      valueB: fmtUsd(assetB.marketCap),
      winner: numWinner(assetA.marketCap, assetB.marketCap),
    },
    {
      label: 'Volume 24h',
      valueA: fmtUsd(assetA.totalVolume),
      valueB: fmtUsd(assetB.totalVolume),
      winner: numWinner(assetA.totalVolume, assetB.totalVolume),
    },
    {
      label: '24h High',
      valueA: fmtUsd(assetA.high24h, 4),
      valueB: fmtUsd(assetB.high24h, 4),
      winner: 'none',
    },
    {
      label: '24h Low',
      valueA: fmtUsd(assetA.low24h, 4),
      valueB: fmtUsd(assetB.low24h, 4),
      winner: 'none',
    },
    {
      label: 'Market Rank',
      valueA: assetA.marketCapRank !== null ? `#${assetA.marketCapRank}` : '—',
      valueB: assetB.marketCapRank !== null ? `#${assetB.marketCapRank}` : '—',
      // Menor rank = mejor posición
      winner: numWinner(assetA.marketCapRank, assetB.marketCapRank, false),
    },
    {
      label: 'Circulating Supply',
      valueA: assetA.circulatingSupply !== null
        ? `${(assetA.circulatingSupply / 1e6).toFixed(2)}M ${assetA.symbol}`
        : '—',
      valueB: assetB.circulatingSupply !== null
        ? `${(assetB.circulatingSupply / 1e6).toFixed(2)}M ${assetB.symbol}`
        : '—',
      winner: 'none',
    },
  ];

  return { assetA, assetB, metrics };
}
