import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import type { AssetsComparison, ComparisonMetric } from '../application/usecases/CompareAssets.usecase';
import type { CoinAsset } from '../domain/entities/CoinAsset';

interface Props {
  assetA: CoinAsset | null;
  assetB: CoinAsset | null;
  comparison: AssetsComparison | null;
  onClear: () => void;
}

const AssetHeader = memo(function AssetHeader({
  asset,
  side,
}: {
  asset: CoinAsset | null;
  side: 'A' | 'B';
}) {
  if (!asset) {
    return (
      <View style={[styles.assetHeader, styles.assetHeaderEmpty]}>
        <Text style={styles.emptySlot}>Select {side === 'A' ? '1st' : '2nd'} coin</Text>
      </View>
    );
  }

  return (
    <View style={styles.assetHeader}>
      {asset.image && (
        <Image source={{ uri: asset.image }} style={styles.assetIcon} contentFit="contain" />
      )}
      <Text style={styles.assetSymbol}>{asset.symbol}</Text>
      <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
    </View>
  );
});

const MetricRow = memo(function MetricRow({ metric }: { metric: ComparisonMetric }) {
  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricCell, metric.winner === 'a' && styles.winnerCell]}>
        <Text
          style={[
            styles.metricValue,
            metric.winner === 'a' && styles.winnerText,
            metric.label === '24h Change' && getCellColorStyle(metric.valueA),
          ]}
        >
          {metric.valueA}
        </Text>
      </View>

      <View style={styles.metricLabelCell}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
      </View>

      <View style={[styles.metricCell, metric.winner === 'b' && styles.winnerCell]}>
        <Text
          style={[
            styles.metricValue,
            metric.winner === 'b' && styles.winnerText,
            metric.label === '24h Change' && getCellColorStyle(metric.valueB),
          ]}
        >
          {metric.valueB}
        </Text>
      </View>
    </View>
  );
});

function getCellColorStyle(value: string) {
  if (value.startsWith('+')) return styles.positive;
  if (value.startsWith('-')) return styles.negative;
  return undefined;
}

export function ComparePanel({ assetA, assetB, comparison, onClear }: Props) {
  const hasAny = assetA !== null || assetB !== null;

  if (!hasAny) return null;

  return (
    <View style={styles.container}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Compare</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clearBtn}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.assetRow}>
        <AssetHeader asset={assetA} side="A" />
        <View style={styles.vsCell}>
          <Text style={styles.vs}>VS</Text>
        </View>
        <AssetHeader asset={assetB} side="B" />
      </View>

      {comparison ? (
        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} scrollEnabled={false}>
          {comparison.metrics.map((metric) => (
            <MetricRow key={metric.label} metric={metric} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.prompt}>
          <Text style={styles.promptText}>Tap a second coin from the list to compare</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  panelTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearBtn: { fontSize: FontSize.sm, color: Colors.brand.primary, fontWeight: FontWeight.semibold },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  assetHeader: { flex: 1, alignItems: 'center', gap: 4 },
  assetHeaderEmpty: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.sm,
    borderStyle: 'dashed',
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  emptySlot: { fontSize: FontSize.xs, color: Colors.text.muted },
  assetIcon: { width: 32, height: 32, borderRadius: 16 },
  assetSymbol: { fontSize: FontSize.md, fontWeight: FontWeight.black, color: Colors.text.primary },
  assetName: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center' },
  vsCell: { width: 32, alignItems: 'center' },
  vs: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.text.muted, letterSpacing: 1 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  metricCell: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  winnerCell: { backgroundColor: Colors.successDim },
  metricLabelCell: { width: 90, alignItems: 'center', paddingVertical: 10 },
  metricLabel: { fontSize: 10, color: Colors.text.muted, textAlign: 'center', fontWeight: FontWeight.medium },
  metricValue: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text.primary, textAlign: 'center' },
  winnerText: { color: Colors.success },
  positive: { color: Colors.success },
  negative: { color: Colors.danger },
  prompt: { paddingVertical: Spacing.md, alignItems: 'center' },
  promptText: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
});
