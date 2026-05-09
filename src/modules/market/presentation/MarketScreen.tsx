import { useUser } from '@clerk/expo';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/shared/theme';
import { useMarketData } from '../application/hooks/useMarketData';
import { useCompareAssets } from '../application/hooks/useCompareAssets';
import type { CoinAsset } from '../domain/entities/CoinAsset';
import { CoinCard } from './CoinCard';
import { ComparePanel } from './ComparePanel';

export function MarketScreen() {
  const { user } = useUser();
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, isError, refetch, isRefetching } = useMarketData();
  const { assetA, assetB, comparison, selectA, selectB, clear } = useCompareAssets();

  const handleCoinPress = useCallback((item: CoinAsset) => {
    if (!assetA) { selectA(item); return; }
    if (!assetB && item.id !== assetA.id) { selectB(item); return; }
    selectA(item);
  }, [assetA, assetB, selectA, selectB]);

  const getSelectedAs = useCallback((item: CoinAsset): 'a' | 'b' | null => {
    if (assetA?.id === item.id) return 'a';
    if (assetB?.id === item.id) return 'b';
    return null;
  }, [assetA, assetB]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>● Offline — showing cached data</Text>
        </View>
      )}

      <FlashList
        data={data ?? []}
        keyExtractor={(item: CoinAsset) => item.id}
        renderItem={({ item }) => (
          <CoinCard item={item} onPress={handleCoinPress} selectedAs={getSelectedAs(item)} />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  Hello, {user?.firstName ?? 'Trader'} 👋
                </Text>
                <Text style={styles.title}>Market</Text>
              </View>
              {(assetA || assetB) && (
                <Text style={styles.hint}>
                  {!assetB ? 'Pick a 2nd coin' : 'Tap to restart'}
                </Text>
              )}
            </View>
            <ComparePanel assetA={assetA} assetB={assetB} comparison={comparison} onClear={clear} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {isError ? 'Failed to load market data' : 'No assets found'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand.primary}
            enabled={isOnline}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: 2 },
  title: { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary },
  hint: { fontSize: FontSize.xs, color: Colors.brand.light, fontWeight: FontWeight.medium, maxWidth: 90, textAlign: 'right' },
  offlineBanner: {
    backgroundColor: Colors.warningDim, paddingVertical: 6, paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.warning + '44',
  },
  offlineText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.medium, textAlign: 'center' },
  loadingText: { color: Colors.text.muted, fontSize: FontSize.sm, marginTop: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.text.muted },
});
