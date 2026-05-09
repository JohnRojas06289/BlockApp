import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import type { Transaction } from '../domain/entities/Transaction';

interface Props { item: Transaction }

function truncateHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export const TransactionRow = memo(function TransactionRow({ item }: Props) {
  const isIn = item.direction === 'incoming';
  return (
    <View style={styles.row}>
      <View style={[styles.badge, isIn ? styles.badgeIn : styles.badgeOut]}>
        <Text style={[styles.badgeIcon, isIn ? styles.iconIn : styles.iconOut]}>
          {isIn ? '↓' : '↑'}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.hash}>{truncateHash(item.hash)}</Text>
        <Text style={styles.date}>
          {item.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.value, isIn ? styles.valueIn : styles.valueOut]}>
          {isIn ? '+' : '-'}{item.valueNative}
        </Text>
        {item.feeNative && (
          <Text style={styles.fee}>fee {item.feeNative}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border.subtle,
  },
  badge: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  badgeIn: { backgroundColor: Colors.successDim },
  badgeOut: { backgroundColor: Colors.dangerDim },
  badgeIcon: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  iconIn: { color: Colors.success },
  iconOut: { color: Colors.danger },
  body: { flex: 1 },
  hash: { fontSize: FontSize.sm, fontFamily: 'monospace', color: Colors.text.primary, fontWeight: FontWeight.medium },
  date: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  amounts: { alignItems: 'flex-end' },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  valueIn: { color: Colors.success },
  valueOut: { color: Colors.danger },
  fee: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
});
