import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import type { CoinAsset } from '../domain/entities/CoinAsset';
import { PriceChange } from './PriceChange';

interface Props {
  item: CoinAsset;
  onPress?: (item: CoinAsset) => void;
  selectedAs?: 'a' | 'b' | null;
}

function formatPrice(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });
}

function formatMarketCap(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

const BADGE_COLORS = { a: Colors.brand.primary, b: Colors.warning };

export const CoinCard = memo(function CoinCard({ item, onPress, selectedAs }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selectedAs && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(item)}
    >
      {selectedAs && (
        <View style={[styles.selectionBar, { backgroundColor: BADGE_COLORS[selectedAs] }]} />
      )}

      <View style={styles.rank}>
        <Text style={styles.rankText}>{item.marketCapRank ?? '—'}</Text>
      </View>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.icon} contentFit="contain" />
      ) : (
        <View style={[styles.icon, styles.iconFallback]} />
      )}

      <View style={styles.nameBlock}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.symbol}>{item.symbol}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(item.currentPrice)}</Text>
        <View style={styles.row}>
          <PriceChange value={item.priceChangePercentage24h} />
          <Text style={styles.mcap}>{formatMarketCap(item.marketCap)}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bg.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border.subtle,
    gap: Spacing.sm,
  },
  cardSelected: { backgroundColor: Colors.brand.dim + '44' },
  cardPressed: { opacity: 0.7 },
  selectionBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  rank: { width: 22, alignItems: 'center' },
  rankText: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.medium },
  icon: { width: 36, height: 36, borderRadius: Radius.full },
  iconFallback: { backgroundColor: Colors.bg.elevated },
  nameBlock: { flex: 1 },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  symbol: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.bold, color: Colors.text.primary },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  mcap: { fontSize: FontSize.xs, color: Colors.text.muted },
});
