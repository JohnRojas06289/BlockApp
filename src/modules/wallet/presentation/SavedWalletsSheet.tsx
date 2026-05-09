import { FlashList } from '@shopify/flash-list';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import { useSavedWallets } from '../application/hooks/useWalletAudit';
import type { WalletBalance, Blockchain } from '../domain/entities/WalletBalance';

interface Props {
  onSelect: (address: string, blockchain: Blockchain) => void;
}

const CHAIN_COLORS: Record<Blockchain, string> = {
  ethereum: '#627eea',
  bitcoin: '#f7931a',
  solana: '#9945ff',
};

const SavedWalletRow = memo(function SavedWalletRow({
  item,
  onSelect,
}: {
  item: WalletBalance;
  onSelect: (address: string, blockchain: Blockchain) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onSelect(item.address, item.blockchain)}
    >
      <View style={[styles.chainDot, { backgroundColor: CHAIN_COLORS[item.blockchain] }]} />
      <View style={styles.rowBody}>
        <Text style={styles.address} numberOfLines={1}>
          {item.label ?? truncateAddress(item.address)}
        </Text>
        <Text style={styles.chain}>{item.blockchain}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.balance}>{item.balanceNative ?? '—'}</Text>
        {item.balanceUsd !== null && (
          <Text style={styles.balanceUsd}>{formatUsd(item.balanceUsd)}</Text>
        )}
      </View>
    </Pressable>
  );
});

export function SavedWalletsSheet({ onSelect }: Props) {
  const { data, isLoading } = useSavedWallets();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No saved wallets</Text>
        <Text style={styles.emptySubtitle}>
          Audit a wallet above to save it for offline access
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Saved Wallets</Text>
      <FlashList
        data={data}
        keyExtractor={(item: WalletBalance) => item.address}
        renderItem={({ item }) => <SavedWalletRow item={item} onSelect={onSelect} />}
        scrollEnabled={false}
      />
    </View>
  );
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const styles = StyleSheet.create({
  container: { marginHorizontal: Spacing.md, marginTop: Spacing.sm },
  center: { padding: Spacing.lg, alignItems: 'center' },
  empty: { padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.muted },
  emptySubtitle: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', lineHeight: 18 },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  rowPressed: { opacity: 0.7 },
  chainDot: { width: 10, height: 10, borderRadius: 5 },
  rowBody: { flex: 1 },
  address: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary, fontFamily: 'monospace' },
  chain: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2, textTransform: 'capitalize' },
  rowRight: { alignItems: 'flex-end' },
  balance: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary },
  balanceUsd: { fontSize: FontSize.xs, color: Colors.text.muted },
});
