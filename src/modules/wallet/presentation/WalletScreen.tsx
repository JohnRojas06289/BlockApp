import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import { useWalletAudit } from '../application/hooks/useWalletAudit';
import type { Blockchain } from '../domain/entities/WalletBalance';
import type { Transaction } from '../domain/entities/Transaction';
import { AddressInput } from './AddressInput';
import { TransactionRow } from './TransactionRow';
import { SavedWalletsSheet } from './SavedWalletsSheet';

function formatUsd(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function WalletScreen() {
  const { isOnline } = useNetworkStatus();
  const [address, setAddress] = useState('');
  const [blockchain, setBlockchain] = useState<Blockchain>('ethereum');

  const { data, isLoading, isError } = useWalletAudit(address, blockchain);

  function handleSubmit(addr: string, chain: Blockchain) {
    setBlockchain(chain);
    setAddress(addr);
  }

  function handleSelectSaved(addr: string, chain: Blockchain) {
    setBlockchain(chain);
    setAddress(addr);
  }

  const hasResult = Boolean(data && !isLoading);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>● Offline — showing cached data</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.subtitle}>Inspect any public address</Text>
        </View>

        <AddressInput onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
            <Text style={styles.loadingText}>Fetching on-chain data...</Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={styles.center}>
            <Text style={styles.errorText}>Could not fetch wallet data</Text>
            <Text style={styles.errorSub}>
              {isOnline
                ? 'Check the address and try again'
                : 'No cached data available for this address'}
            </Text>
          </View>
        )}

        {hasResult && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Balance</Text>
              <Text style={styles.balanceNative}>
                {data!.balance.balanceNative ?? '—'}{' '}
                <Text style={styles.chainLabel}>{blockchain.toUpperCase()}</Text>
              </Text>
              <Text style={styles.balanceUsd}>{formatUsd(data!.balance.balanceUsd)}</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Received</Text>
                  <Text style={styles.statValue}>{data!.balance.totalReceived ?? '—'}</Text>
                </View>
                <View style={[styles.stat, styles.statBorder]}>
                  <Text style={styles.statLabel}>Sent</Text>
                  <Text style={styles.statValue}>{data!.balance.totalSent ?? '—'}</Text>
                </View>
                <View style={[styles.stat, styles.statBorder]}>
                  <Text style={styles.statLabel}>Txs</Text>
                  <Text style={styles.statValue}>{data!.balance.transactionCount ?? '—'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Transaction History</Text>

            {data!.transactions.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.errorSub}>No transactions cached for this address</Text>
              </View>
            ) : (
              <View style={styles.txList}>
                <FlashList
                  data={data!.transactions}
                  keyExtractor={(item: Transaction) => item.hash}
                  renderItem={({ item }) => <TransactionRow item={item} />}
                  scrollEnabled={false}
                />
              </View>
            )}

            <View style={styles.divider} />
          </>
        )}

        <SavedWalletsSheet onSelect={handleSelectSaved} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 4 },
  title: { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },
  offlineBanner: {
    backgroundColor: Colors.warningDim,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warning + '44',
  },
  offlineText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.medium, textAlign: 'center' },
  center: { padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
  loadingText: { color: Colors.text.muted, fontSize: FontSize.sm, marginTop: Spacing.sm },
  errorText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  errorSub: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
  card: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    gap: 6,
  },
  cardLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceNative: { fontSize: 26, fontWeight: FontWeight.black, color: Colors.text.primary },
  chainLabel: { fontSize: FontSize.md, color: Colors.brand.primary },
  balanceUsd: { fontSize: FontSize.md, color: Colors.text.muted, fontWeight: FontWeight.medium },
  statsRow: { flexDirection: 'row', marginTop: Spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: Colors.border.subtle },
  statLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
  },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary, marginTop: 2 },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.muted,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txList: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.bg.secondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
});
