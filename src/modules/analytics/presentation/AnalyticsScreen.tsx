import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarketData } from '@/src/modules/market/application/hooks/useMarketData';
import { useSavedWallets } from '@/src/modules/wallet/application/hooks/useWalletAudit';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import { useAssetHistory } from '../application/hooks/useAssetHistory';
import {
  buildAnalyticsAssets,
  buildHistoryPoints,
  buildMarketPulse,
  pickFeaturedAssets,
  type AnalyticsAsset,
  type CapFilter,
  type ChartRange,
  type HistoryMetric,
  type SortBy,
  type TrendFilter,
} from '../application/usecases/buildAnalyticsDataset';
import { TrendBars } from './TrendBars';

const CHART_RANGE_OPTIONS: ChartRange[] = ['7D', '30D', '90D'];
const HISTORY_METRIC_OPTIONS: Array<{ label: string; value: HistoryMetric }> = [
  { label: 'Price', value: 'price' },
  { label: 'Cap', value: 'marketCap' },
  { label: 'Volume', value: 'volume' },
];

const SETUP_OPTIONS: Array<{ label: string; value: TrendFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Leaders', value: 'leaders' },
  { label: 'Momentum', value: 'momentum' },
  { label: 'Reversal', value: 'reversal' },
];

const CAP_OPTIONS: Array<{ label: string; value: CapFilter }> = [
  { label: 'All caps', value: 'all' },
  { label: 'Large', value: 'large' },
  { label: 'Mid', value: 'mid' },
  { label: 'Small', value: 'small' },
];

const SORT_OPTIONS: Array<{ label: string; value: SortBy }> = [
  { label: 'Conviction', value: 'conviction' },
  { label: 'Mkt Cap', value: 'marketCap' },
  { label: 'Liquidity', value: 'liquidity' },
  { label: 'ATH Gap', value: 'athGap' },
];

const METRIC_GUIDES = [
  {
    title: 'Breadth',
    body: 'Shows how much of the tracked market is participating. Higher breadth means the move is broad, not just driven by one coin.',
  },
  {
    title: 'Conviction',
    body: 'Internal score based on trend alignment, liquidity, distance to all-time-high and volatility. Higher means cleaner structure.',
  },
  {
    title: 'Liquidity',
    body: 'Volume as a percentage of market cap. Higher liquidity usually makes moves easier to trust and easier to trade.',
  },
  {
    title: 'ATH gap',
    body: 'Distance to all-time-high. A smaller negative gap means price is closer to reclaiming its strongest reference zone.',
  },
] as const;

export function AnalyticsScreen() {
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, isError, refetch, isRefetching } = useMarketData(24);
  const { data: savedWallets } = useSavedWallets();

  const [query, setQuery] = useState('');
  const [chartRange, setChartRange] = useState<ChartRange>('30D');
  const [historyMetric, setHistoryMetric] = useState<HistoryMetric>('price');
  const [setupFilter, setSetupFilter] = useState<TrendFilter>('all');
  const [capFilter, setCapFilter] = useState<CapFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('conviction');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const analyticsAssets = useMemo(() => buildAnalyticsAssets(data ?? []), [data]);
  const hasActiveFilters =
    query.trim().length > 0 || setupFilter !== 'all' || capFilter !== 'all';

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return analyticsAssets
      .filter((asset) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          asset.name.toLowerCase().includes(normalizedQuery) ||
          asset.symbol.toLowerCase().includes(normalizedQuery);

        const matchesSetup =
          setupFilter === 'all' ||
          (setupFilter === 'leaders' && asset.setup === 'Leader') ||
          (setupFilter === 'momentum' && asset.setup === 'Momentum') ||
          (setupFilter === 'reversal' && asset.setup === 'Reversal');

        const matchesCap = capFilter === 'all' || asset.capTier === capFilter;

        return matchesQuery && matchesSetup && matchesCap;
      })
      .sort((left, right) => {
        if (sortBy === 'marketCap') return (right.marketCap ?? 0) - (left.marketCap ?? 0);
        if (sortBy === 'liquidity') return (right.liquidityRatio ?? 0) - (left.liquidityRatio ?? 0);
        if (sortBy === 'athGap') return (right.distanceToAth ?? -999) - (left.distanceToAth ?? -999);
        return right.conviction - left.conviction;
      });
  }, [analyticsAssets, capFilter, query, setupFilter, sortBy]);

  const selectionUniverse = useMemo(
    () => (filteredAssets.length > 0 ? filteredAssets : analyticsAssets),
    [analyticsAssets, filteredAssets],
  );

  const selectedAsset = useMemo(
    () =>
      selectionUniverse.find((asset) => asset.id === selectedAssetId) ??
      selectionUniverse[0] ??
      null,
    [selectedAssetId, selectionUniverse],
  );

  const {
    data: historyResult,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useAssetHistory(
    selectedAsset?.id ?? null,
    chartRange,
  );

  const pulseAssets = filteredAssets.length > 0 ? filteredAssets : analyticsAssets;
  const marketPulse = useMemo(() => buildMarketPulse(pulseAssets), [pulseAssets]);
  const featuredAssets = useMemo(() => pickFeaturedAssets(pulseAssets), [pulseAssets]);

  const chartPoints = useMemo(() => {
    if (historyResult?.dataset) {
      return buildHistoryPoints(historyResult.dataset, historyMetric, chartRange);
    }

    if (selectedAsset?.sparkline.length && historyMetric === 'price' && chartRange === '7D') {
      return selectedAsset.sparkline;
    }

    return [];
  }, [chartRange, historyMetric, historyResult, selectedAsset]);

  const historyMetaText = useMemo(() => {
    if (!historyResult) return null;

    const sourceText =
      historyResult.source === 'live'
        ? 'Live history from CoinGecko'
        : 'Cached historical snapshot';

    const cachedAt = historyResult.cachedAt
      ? historyResult.cachedAt.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

    return cachedAt ? `${sourceText} · updated ${cachedAt}` : sourceText;
  }, [historyResult]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading market intelligence…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>● Offline — some historical views may be limited</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand.primary}
            enabled={isOnline}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Real market signals, better cards, and history that helps you read what the market is
            doing.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroEyebrow}>Market radar</Text>
              <Text style={styles.heroTitle}>{marketPulse.regime}</Text>
              <Text style={styles.heroNote}>{marketPulse.note}</Text>
            </View>

            <View style={styles.heroBadge}>
              <FontAwesome name="signal" size={16} color={Colors.brand.primary} />
              <Text style={styles.heroBadgeText}>{marketPulse.breadth24h.toFixed(0)}% breadth</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <HeroMetric
              icon="line-chart"
              label="Avg 7D"
              value={formatPercent(marketPulse.average7d)}
              tone={marketPulse.average7d >= 0 ? 'success' : 'danger'}
            />
            <HeroMetric
              icon="exchange"
              label="Vol/Cap"
              value={`${marketPulse.volumeToCap.toFixed(1)}%`}
              tone="brand"
            />
            <HeroMetric
              icon="database"
              label="Coverage"
              value={`${pulseAssets.length} assets`}
              tone="brand"
            />
            <HeroMetric
              icon="user-circle"
              label="Wallets"
              value={`${savedWallets?.length ?? 0}`}
              tone="brand"
            />
          </View>
        </View>

        <View style={styles.signalGrid}>
          <SignalCard
            title="Breadth 24h"
            value={`${marketPulse.breadth24h.toFixed(0)}%`}
            detail={`${pulseAssets.filter((asset) => (asset.priceChangePercentage24h ?? 0) >= 0).length}/${pulseAssets.length} names green`}
            icon="compass"
            tone={marketPulse.breadth24h >= 50 ? 'success' : 'danger'}
          />
          <SignalCard
            title="Avg 30d"
            value={formatPercent(marketPulse.average30d)}
            detail="Medium-term drift"
            icon="calendar"
            tone={marketPulse.average30d >= 0 ? 'success' : 'danger'}
          />
          <SignalCard
            title="Top setup"
            value={marketPulse.leader?.symbol ?? '—'}
            detail={
              marketPulse.leader
                ? `${marketPulse.leader.setup} · ${marketPulse.leader.conviction.toFixed(0)} score`
                : 'No leader yet'
            }
            icon="trophy"
            tone="brand"
          />
          <SignalCard
            title="Reversal"
            value={marketPulse.reversal?.symbol ?? '—'}
            detail={
              marketPulse.reversal
                ? `${formatPercent(marketPulse.reversal.priceChangePercentage24h ?? 0)} today`
                : 'Nothing notable'
            }
            icon="refresh"
            tone="warning"
          />
        </View>

        <View style={styles.controlCard}>
          <Text style={styles.sectionLabel}>Query & filters</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by coin name or symbol"
            placeholderTextColor={Colors.text.muted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ControlRow label="Setup">
            {SETUP_OPTIONS.map((option) => (
              <FilterPill
                key={option.value}
                label={option.label}
                active={setupFilter === option.value}
                onPress={() => setSetupFilter(option.value)}
              />
            ))}
          </ControlRow>

          <ControlRow label="Cap tier">
            {CAP_OPTIONS.map((option) => (
              <FilterPill
                key={option.value}
                label={option.label}
                active={capFilter === option.value}
                onPress={() => setCapFilter(option.value)}
              />
            ))}
          </ControlRow>

          <ControlRow label="Sort by">
            {SORT_OPTIONS.map((option) => (
              <FilterPill
                key={option.value}
                label={option.label}
                active={sortBy === option.value}
                onPress={() => setSortBy(option.value)}
              />
            ))}
          </ControlRow>
        </View>

        {selectedAsset && (
          <View style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <View style={styles.focusAssetInfo}>
                {selectedAsset.image ? (
                  <Image source={{ uri: selectedAsset.image }} style={styles.focusIcon} contentFit="contain" />
                ) : (
                  <View style={[styles.focusIcon, styles.iconFallback]} />
                )}

                <View style={styles.focusTitleWrap}>
                  <Text style={styles.focusEyebrow}>Focus asset</Text>
                  <Text style={styles.focusTitle}>{selectedAsset.name}</Text>
                  <Text style={styles.focusSubtitle}>
                    {selectedAsset.symbol} · rank #{selectedAsset.marketCapRank ?? '—'} · {selectedAsset.setup}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreBadge}>
                <Text style={styles.scoreValue}>{selectedAsset.conviction.toFixed(0)}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
            </View>

            <View style={styles.timeframeRow}>
              {CHART_RANGE_OPTIONS.map((option) => (
                <FilterPill
                  key={option}
                  label={option}
                  active={chartRange === option}
                  onPress={() => setChartRange(option)}
                />
              ))}
            </View>

            <View style={styles.timeframeRow}>
              {HISTORY_METRIC_OPTIONS.map((option) => (
                <FilterPill
                  key={option.value}
                  label={option.label}
                  active={historyMetric === option.value}
                  onPress={() => setHistoryMetric(option.value)}
                />
              ))}
            </View>

            <View style={styles.focusPriceRow}>
              <Text style={styles.focusPrice}>{formatCurrency(selectedAsset.currentPrice)}</Text>
              <View style={styles.timeframeChips}>
                <TimeframeChip label="1H" value={selectedAsset.priceChangePercentage1h} />
                <TimeframeChip label="24H" value={selectedAsset.priceChangePercentage24h} />
                <TimeframeChip label="7D" value={selectedAsset.priceChangePercentage7d} />
                <TimeframeChip label="30D" value={selectedAsset.priceChangePercentage30d} />
              </View>
            </View>

            {isHistoryLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator color={Colors.brand.primary} />
                <Text style={styles.helperText}>Loading real historical data…</Text>
              </View>
            ) : chartPoints.length > 0 ? (
              <>
                <TrendBars
                  data={chartPoints}
                  height={120}
                  tone={(selectedAsset.priceChangePercentage7d ?? 0) >= 0 ? 'success' : 'danger'}
                />
                <View style={styles.axisRow}>
                  <Text style={styles.axisText}>{chartPoints[0]?.label}</Text>
                  <Text style={styles.axisText}>Now</Text>
                </View>
                <Text style={styles.helperText}>
                  Real {historyMetric === 'price' ? 'price' : historyMetric === 'marketCap' ? 'market cap' : 'volume'} history from CoinGecko for {chartRange}.
                </Text>
                {historyMetaText && (
                  <Text style={styles.helperSubtext}>{historyMetaText}</Text>
                )}
              </>
            ) : (
              <EmptyState
                title="Historical chart unavailable"
                description={
                  isHistoryError && historyError instanceof Error
                    ? historyError.message
                    : 'This range needs an online response from the API or a cached native snapshot.'
                }
              />
            )}

            <View style={styles.metricGrid}>
              <MetricTile
                label="ATH gap"
                value={selectedAsset.distanceToAth !== null ? formatPercent(selectedAsset.distanceToAth) : '—'}
              />
              <MetricTile
                label="Liquidity"
                value={selectedAsset.liquidityRatio !== null ? `${selectedAsset.liquidityRatio.toFixed(2)}%` : '—'}
              />
              <MetricTile
                label="Dominance"
                value={`${selectedAsset.dominance.toFixed(1)}%`}
              />
              <MetricTile
                label="Supply"
                value={selectedAsset.supplyProgress !== null ? `${selectedAsset.supplyProgress.toFixed(0)}%` : '—'}
              />
            </View>

            <Text style={styles.focusInsight}>{selectedAsset.insight}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>How to read this</Text>
          <Text style={styles.sectionMeta}>so the numbers actually help</Text>
        </View>

        <View style={styles.guideGrid}>
          {METRIC_GUIDES.map((item) => (
            <View key={item.title} style={styles.guideCard}>
              <Text style={styles.guideTitle}>{item.title}</Text>
              <Text style={styles.guideBody}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Scout cards</Text>
          <Text style={styles.sectionMeta}>premium watchlist view</Text>
        </View>

        {featuredAssets.map((asset) => (
          <Pressable
            key={asset.id}
            style={({ pressed }) => [
              styles.deckCard,
              getDeckAccentStyle(asset.setup),
              selectedAsset?.id === asset.id && styles.deckCardSelected,
              pressed && styles.deckCardPressed,
            ]}
            onPress={() => setSelectedAssetId(asset.id)}
          >
            <View style={styles.deckTopRow}>
              <View style={styles.deckIdentity}>
                {asset.image ? (
                  <Image source={{ uri: asset.image }} style={styles.deckIcon} contentFit="contain" />
                ) : (
                  <View style={[styles.deckIcon, styles.iconFallback]} />
                )}
                <View style={styles.deckTitleWrap}>
                  <Text style={styles.deckTitle}>{asset.name}</Text>
                  <Text style={styles.deckSubtitle}>
                    {asset.symbol} · {asset.setup} · {asset.capTier} cap
                  </Text>
                </View>
              </View>

              <View style={styles.deckBadges}>
                <Badge text={`#${asset.marketCapRank ?? '—'}`} tone="brand" />
                <Badge text={`${asset.conviction.toFixed(0)} score`} tone="success" />
              </View>
            </View>

            <View style={styles.deckMiddleRow}>
              <View style={styles.deckChartWrap}>
                <TrendBars
                  data={asset.sparkline}
                  height={72}
                  tone={(asset.priceChangePercentage7d ?? 0) >= 0 ? 'success' : 'danger'}
                />
              </View>

              <View style={styles.deckNumbers}>
                <Text style={styles.deckPrice}>{formatCurrency(asset.currentPrice)}</Text>
                <Text
                  style={[
                    styles.deckChange,
                    (asset.priceChangePercentage7d ?? 0) >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  7D {formatPercent(asset.priceChangePercentage7d ?? 0)}
                </Text>
                <Text style={styles.deckSecondary}>
                  30D {formatPercent(asset.priceChangePercentage30d ?? 0)}
                </Text>
              </View>
            </View>

            <View style={styles.deckFooter}>
              <MiniMetric label="Mkt Cap" value={formatCompactCurrency(asset.marketCap ?? 0)} />
              <MiniMetric
                label="Volume"
                value={formatCompactCurrency(asset.totalVolume ?? 0)}
              />
              <MiniMetric
                label="ATH gap"
                value={asset.distanceToAth !== null ? formatPercent(asset.distanceToAth) : '—'}
              />
            </View>

            <Text style={styles.deckInsight}>{asset.insight}</Text>
          </Pressable>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Leaderboard</Text>
          <Text style={styles.sectionMeta}>
            {filteredAssets.length} result{filteredAssets.length === 1 ? '' : 's'}
          </Text>
        </View>

        {hasActiveFilters && filteredAssets.length === 0 ? (
          <EmptyState
            title="No results for current filters"
            description="Try another symbol, setup, or cap tier."
          />
        ) : (
          filteredAssets.map((asset) => (
            <Pressable
              key={asset.id}
              style={({ pressed }) => [
                styles.rowCard,
                selectedAsset?.id === asset.id && styles.rowCardSelected,
                pressed && styles.rowCardPressed,
              ]}
              onPress={() => setSelectedAssetId(asset.id)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowRank}>#{asset.marketCapRank ?? '—'}</Text>
                {asset.image ? (
                  <Image source={{ uri: asset.image }} style={styles.rowIcon} contentFit="contain" />
                ) : (
                  <View style={[styles.rowIcon, styles.iconFallback]} />
                )}
                <View style={styles.rowTitleWrap}>
                  <Text style={styles.rowTitle}>{asset.name}</Text>
                  <Text style={styles.rowSubtitle}>
                    {asset.symbol} · {asset.setup} · {asset.conviction.toFixed(0)} score
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Text style={styles.rowPrice}>{formatCurrency(asset.currentPrice)}</Text>
                <Text
                  style={[
                    styles.rowChange,
                    (asset.priceChangePercentage24h ?? 0) >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {formatPercent(asset.priceChangePercentage24h ?? 0)}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {isError && (
          <EmptyState
            title="API response problem"
            description="The market feed could not be refreshed right now. Cached/current data may still be visible."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'danger';
}) {
  return (
    <View style={styles.heroMetric}>
      <View style={[styles.heroMetricIcon, getToneBgStyle(tone)]}>
        <FontAwesome name={icon} size={13} color={getToneColor(tone)} />
      </View>
      <Text style={styles.heroMetricLabel}>{label}</Text>
      <Text style={styles.heroMetricValue}>{value}</Text>
    </View>
  );
}

function SignalCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  tone: 'brand' | 'success' | 'danger' | 'warning';
}) {
  return (
    <View style={styles.signalCard}>
      <View style={styles.signalTop}>
        <View style={[styles.signalIconWrap, getToneBgStyle(tone)]}>
          <FontAwesome name={icon} size={13} color={getToneColor(tone)} />
        </View>
        <Text style={styles.signalTitle}>{title}</Text>
      </View>
      <Text style={styles.signalValue}>{value}</Text>
      <Text style={styles.signalDetail}>{detail}</Text>
    </View>
  );
}

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>
      <View style={styles.pillsRow}>{children}</View>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pillPressed,
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TimeframeChip({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const numericValue = value ?? 0;
  const positive = numericValue >= 0;

  return (
    <View
      style={[
        styles.timeframeChip,
        positive ? styles.timeframeChipPositive : styles.timeframeChipNegative,
      ]}
    >
      <Text style={styles.timeframeChipLabel}>{label}</Text>
      <Text style={[styles.timeframeChipValue, positive ? styles.positive : styles.negative]}>
        {formatPercent(numericValue)}
      </Text>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricTileLabel}>{label}</Text>
      <Text style={styles.metricTileValue}>{value}</Text>
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: 'brand' | 'success' }) {
  return (
    <View style={[styles.badge, getToneBgStyle(tone)]}>
      <Text style={[styles.badgeText, { color: getToneColor(tone) }]}>{text}</Text>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricLabel}>{label}</Text>
      <Text style={styles.miniMetricValue}>{value}</Text>
    </View>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  }

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  });
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getToneColor(tone: 'brand' | 'success' | 'danger' | 'warning') {
  if (tone === 'success') return Colors.success;
  if (tone === 'danger') return Colors.danger;
  if (tone === 'warning') return Colors.warning;
  return Colors.brand.primary;
}

function getToneBgStyle(tone: 'brand' | 'success' | 'danger' | 'warning') {
  if (tone === 'success') return styles.toneSuccess;
  if (tone === 'danger') return styles.toneDanger;
  if (tone === 'warning') return styles.toneWarning;
  return styles.toneBrand;
}

function getDeckAccentStyle(setup: AnalyticsAsset['setup']) {
  if (setup === 'Leader') return styles.deckLeader;
  if (setup === 'Momentum') return styles.deckMomentum;
  if (setup === 'Reversal') return styles.deckReversal;
  return styles.deckWatch;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.xxl, gap: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg },
  loadingText: { color: Colors.text.muted, fontSize: FontSize.sm },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 4 },
  title: { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, lineHeight: 18 },
  offlineBanner: {
    backgroundColor: Colors.warningDim,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warning + '44',
  },
  offlineText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.medium, textAlign: 'center' },
  heroCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.brand.dim,
    gap: Spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  heroTitleWrap: { flex: 1, gap: 4 },
  heroEyebrow: {
    fontSize: FontSize.xs,
    color: Colors.brand.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: FontWeight.bold,
  },
  heroTitle: { fontSize: FontSize.xxl, color: Colors.text.primary, fontWeight: FontWeight.black },
  heroNote: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 18 },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  heroBadgeText: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  heroStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  heroMetric: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    padding: 12,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  heroMetricIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetricLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  heroMetricValue: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.bold },
  signalGrid: {
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  signalCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  signalTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  signalIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalTitle: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  signalValue: { fontSize: FontSize.lg, color: Colors.text.primary, fontWeight: FontWeight.black },
  signalDetail: { fontSize: FontSize.xs, color: Colors.text.muted, lineHeight: 16 },
  controlCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionMeta: { fontSize: FontSize.xs, color: Colors.text.muted },
  searchInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.bg.input,
    color: Colors.text.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.sm,
  },
  controlRow: { gap: Spacing.sm },
  controlLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.bg.elevated,
  },
  pillActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  pillPressed: { opacity: 0.82 },
  pillText: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  pillTextActive: { color: '#ffffff' },
  focusCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  focusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  focusAssetInfo: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  focusIcon: { width: 44, height: 44, borderRadius: Radius.full },
  iconFallback: { backgroundColor: Colors.bg.elevated },
  focusTitleWrap: { flex: 1, gap: 2 },
  focusEyebrow: { fontSize: FontSize.xs, color: Colors.brand.light, textTransform: 'uppercase', letterSpacing: 0.8 },
  focusTitle: { fontSize: FontSize.xl, color: Colors.text.primary, fontWeight: FontWeight.black },
  focusSubtitle: { fontSize: FontSize.xs, color: Colors.text.muted },
  scoreBadge: {
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  scoreValue: { fontSize: FontSize.lg, color: Colors.text.primary, fontWeight: FontWeight.black },
  scoreLabel: { fontSize: 10, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  timeframeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  focusPriceRow: { gap: Spacing.sm },
  focusPrice: { fontSize: 30, color: Colors.text.primary, fontWeight: FontWeight.black },
  timeframeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeframeChip: {
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.bg.elevated,
    minWidth: 70,
  },
  timeframeChipPositive: { borderWidth: 1, borderColor: Colors.success + '55' },
  timeframeChipNegative: { borderWidth: 1, borderColor: Colors.danger + '55' },
  timeframeChipLabel: { fontSize: 10, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeframeChipValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginTop: 2 },
  chartLoading: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  axisText: { fontSize: FontSize.xs, color: Colors.text.muted },
  helperText: { fontSize: FontSize.xs, color: Colors.text.muted },
  helperSubtext: { fontSize: 10, color: Colors.text.muted, opacity: 0.9 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    padding: 12,
    gap: 4,
  },
  metricTileLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricTileValue: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.bold },
  focusInsight: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 19 },
  guideGrid: {
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  guideCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  guideTitle: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.bold },
  guideBody: { fontSize: FontSize.xs, color: Colors.text.secondary, lineHeight: 18 },
  deckCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
  },
  deckLeader: { borderColor: Colors.brand.primary + '88' },
  deckMomentum: { borderColor: Colors.success + '88' },
  deckReversal: { borderColor: Colors.warning + '88' },
  deckWatch: { borderColor: Colors.border.default },
  deckCardSelected: {
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  deckCardPressed: { opacity: 0.9 },
  deckTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  deckIdentity: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  deckIcon: { width: 40, height: 40, borderRadius: Radius.full },
  deckTitleWrap: { flex: 1 },
  deckTitle: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.black },
  deckSubtitle: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  deckBadges: { alignItems: 'flex-end', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  deckMiddleRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  deckChartWrap: { flex: 1 },
  deckNumbers: { minWidth: 98, alignItems: 'flex-end', gap: 4 },
  deckPrice: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.black },
  deckChange: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  deckSecondary: { fontSize: FontSize.xs, color: Colors.text.muted },
  deckFooter: { flexDirection: 'row', gap: Spacing.sm },
  miniMetric: { flex: 1, gap: 2 },
  miniMetricLabel: { fontSize: 10, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  miniMetricValue: { fontSize: FontSize.xs, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  deckInsight: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 18 },
  rowCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowCardSelected: { borderColor: Colors.brand.primary },
  rowCardPressed: { opacity: 0.85 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  rowRank: { width: 32, fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.bold },
  rowIcon: { width: 28, height: 28, borderRadius: Radius.full },
  rowTitleWrap: { flex: 1 },
  rowTitle: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  rowSubtitle: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowPrice: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.bold },
  rowChange: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  emptyState: {
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  emptyTitle: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  emptyDescription: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', lineHeight: 18 },
  positive: { color: Colors.success },
  negative: { color: Colors.danger },
  toneBrand: { backgroundColor: Colors.brand.glow },
  toneSuccess: { backgroundColor: Colors.successDim },
  toneDanger: { backgroundColor: Colors.dangerDim },
  toneWarning: { backgroundColor: Colors.warningDim },
});
