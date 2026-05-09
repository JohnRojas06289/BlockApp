import { useAuth } from '@clerk/expo';
import { Link, Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const SPARK = [28, 42, 22, 58, 34, 72, 48, 84, 62, 96, 78, 100];

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin',  price: '$67,240', change: '+2.4%', color: Colors.chain.bitcoin },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,180',  change: '+1.8%', color: Colors.chain.ethereum },
  { symbol: 'SOL', name: 'Solana',   price: '$142.80', change: '+5.2%', color: Colors.chain.solana },
] as const;

const HOLDINGS = [
  { chain: 'Bitcoin',  amount: '0.042 BTC', value: '$2,840',  color: Colors.chain.bitcoin },
  { chain: 'Ethereum', amount: '1.8 ETH',   value: '$5,400',  color: Colors.chain.ethereum },
  { chain: 'Solana',   amount: '120 SOL',   value: '$14,400', color: Colors.chain.solana },
] as const;

const NETWORKS = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: Colors.chain.bitcoin,
    stat: '420M+ addresses',
    desc: 'The original blockchain. Audit any BTC wallet instantly.',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    color: Colors.chain.ethereum,
    stat: '250M+ wallets',
    desc: 'Full ERC-20 token support across mainnet and L2s.',
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    color: Colors.chain.solana,
    stat: '150M+ accounts',
    desc: 'SPL token support with lightning-fast data fetching.',
  },
] as const;

// ─── Pages ─────────────────────────────────────────────────────────────────────

function PageHero() {
  return (
    <View style={p.container}>
      <View style={p.glowRing} />

      <View style={p.logoWrap}>
        <View style={p.logoMark}>
          <Text style={p.logoLetter}>B</Text>
        </View>
        <View style={p.logoDot} />
      </View>

      <Text style={p.appName}>BlockApp</Text>

      <Text style={p.headline}>{'Your crypto portfolio,\nalways with you'}</Text>

      <Text style={p.subheadline}>
        Track prices, audit wallets, and monitor your on-chain assets — all in one place, even offline.
      </Text>

      <View style={p.statsRow}>
        {([['3', 'Networks'], ['10K+', 'Assets'], ['100%', 'Offline']] as const).map(
          ([val, label]) => (
            <View key={label} style={p.statBox}>
              <Text style={p.statVal}>{val}</Text>
              <Text style={p.statLabel}>{label}</Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

function PageMarket() {
  return (
    <View style={p.container}>
      <Text style={p.badge}>REAL-TIME MARKET DATA</Text>
      <Text style={p.featureTitle}>{'Know what the market\nis doing. Always.'}</Text>
      <Text style={p.featureDesc}>
        Live prices, 24h changes, and market cap for thousands of crypto assets powered by CoinGecko.
      </Text>

      <View style={p.sparkCard}>
        <View style={p.sparkHeader}>
          <Text style={p.sparkName}>Bitcoin (BTC)</Text>
          <Text style={p.sparkPrice}>
            $67,240{'  '}
            <Text style={p.sparkUp}>+2.4%</Text>
          </Text>
        </View>
        <View style={p.sparkBars}>
          {SPARK.map((h, i) => (
            <View
              key={i}
              style={[
                p.sparkBar,
                {
                  height: (h / 100) * 56,
                  opacity: 0.35 + (i / SPARK.length) * 0.65,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {COINS.map((c) => (
        <View key={c.symbol} style={p.coinRow}>
          <View style={[p.coinDot, { backgroundColor: c.color }]} />
          <Text style={p.coinSymbol}>{c.symbol}</Text>
          <Text style={p.coinName}>{c.name}</Text>
          <Text style={p.coinPrice}>{c.price}</Text>
          <Text style={p.coinChange}>{c.change}</Text>
        </View>
      ))}
    </View>
  );
}

function PageWallet() {
  return (
    <View style={p.container}>
      <Text style={p.badge}>ON-CHAIN AUDIT</Text>
      <Text style={p.featureTitle}>{'Your entire on-chain\nportfolio, instantly.'}</Text>
      <Text style={p.featureDesc}>
        Paste any public wallet address and get a full breakdown of your holdings across all supported networks.
      </Text>

      <View style={p.walletCard}>
        <View style={p.addressBox}>
          <Text style={p.addressLabel}>WALLET ADDRESS</Text>
          <Text style={p.addressText}>0x1A2b3C4d...8F3d</Text>
        </View>

        <Text style={p.arrowDown}>↓</Text>

        {HOLDINGS.map((h) => (
          <View key={h.chain} style={p.holdingRow}>
            <View style={[p.holdingDot, { backgroundColor: h.color }]} />
            <Text style={p.holdingChain}>{h.chain}</Text>
            <Text style={p.holdingAmount}>{h.amount}</Text>
            <Text style={p.holdingValue}>{h.value}</Text>
          </View>
        ))}

        <View style={p.totalRow}>
          <Text style={p.totalLabel}>TOTAL VALUE</Text>
          <Text style={p.totalValue}>$22,640</Text>
        </View>
      </View>
    </View>
  );
}

function PageOffline() {
  const bars = [
    { label: 'Local cache',  pct: 1,    color: Colors.success },
    { label: 'Market prices', pct: 0.85, color: Colors.brand.primary },
    { label: 'Wallet data',  pct: 0.72, color: Colors.chain.solana },
  ] as const;

  return (
    <View style={p.container}>
      <Text style={p.badge}>OFFLINE FIRST</Text>
      <Text style={p.featureTitle}>{'Your data.\nAlways available.'}</Text>
      <Text style={p.featureDesc}>
        Your portfolio is stored locally using SQLite. Browse and audit your holdings even without an internet connection.
      </Text>

      <View style={p.syncDiagram}>
        <View style={p.syncBox}>
          <Text style={p.syncIcon}>📱</Text>
          <Text style={p.syncBoxLabel}>Device</Text>
          <Text style={p.syncBoxSub}>SQLite</Text>
        </View>
        <Text style={p.syncArrow}>↔</Text>
        <View style={p.syncBox}>
          <Text style={p.syncIcon}>☁️</Text>
          <Text style={p.syncBoxLabel}>Cloud</Text>
          <Text style={p.syncBoxSub}>Turso</Text>
        </View>
      </View>

      <View style={p.statusList}>
        {bars.map(({ label, pct, color }) => (
          <View key={label} style={p.statusRow}>
            <View style={p.statusMeta}>
              <Text style={p.statusLabel}>{label}</Text>
              <Text style={[p.statusPct, { color }]}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={p.statusTrack}>
              <View
                style={[
                  p.statusFill,
                  { width: `${pct * 100}%` as `${number}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PageNetworks() {
  return (
    <View style={p.container}>
      <Text style={p.badge}>SUPPORTED NETWORKS</Text>
      <Text style={p.featureTitle}>{'Multi-chain\nfrom day one.'}</Text>

      {NETWORKS.map((n) => (
        <View key={n.name} style={[p.networkCard, { borderLeftColor: n.color }]}>
          <View style={p.networkHeader}>
            <View style={[p.networkBadge, { backgroundColor: n.color + '22' }]}>
              <Text style={[p.networkSymbol, { color: n.color }]}>{n.symbol}</Text>
            </View>
            <View style={p.networkMeta}>
              <Text style={p.networkName}>{n.name}</Text>
              <Text style={p.networkStat}>{n.stat}</Text>
            </View>
          </View>
          <Text style={p.networkDesc}>{n.desc}</Text>
        </View>
      ))}
    </View>
  );
}

function PageCTA() {
  return (
    <View style={[p.container, p.ctaContainer]}>
      <View style={p.ctaGlow} />

      <View style={p.ctaLogoMark}>
        <Text style={p.ctaLogoLetter}>B</Text>
      </View>

      <Text style={p.ctaHeadline}>{'Ready to take\ncontrol?'}</Text>

      <Text style={p.ctaSubheadline}>
        Join thousands of crypto users who track their on-chain portfolio with BlockApp.
      </Text>

      <Link href="/sign-up" asChild>
        <Pressable style={({ pressed }) => [p.ctaPrimary, pressed && p.pressed]}>
          <Text style={p.ctaPrimaryText}>Get Started — it's free</Text>
        </Pressable>
      </Link>

      <Link href="/sign-in" asChild>
        <Pressable style={({ pressed }) => [p.ctaSecondary, pressed && p.pressed]}>
          <Text style={p.ctaSecondaryText}>I already have an account</Text>
        </Pressable>
      </Link>

      <Text style={p.ctaFooter}>Market data by CoinGecko · Chain data by Blockchair</Text>
    </View>
  );
}

// ─── Registry ──────────────────────────────────────────────────────────────────

const PAGES: React.ComponentType[] = [
  PageHero,
  PageMarket,
  PageWallet,
  PageOffline,
  PageNetworks,
  PageCTA,
];

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function LandingScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (isLoaded && isSignedIn) return <Redirect href="/(tabs)" />;

  const goTo = (index: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const isFirst = currentPage === 0;
  const isLast  = currentPage === PAGES.length - 1;
  const ActivePage = PAGES[currentPage];

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.flex1} />
        {!isLast && (
          <Pressable onPress={() => goTo(PAGES.length - 1)} style={s.skipBtn}>
            <Text style={s.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Active page */}
      <Animated.View style={[s.pageWrap, { opacity: fadeAnim }]}>
        <ActivePage />
      </Animated.View>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        <Pressable
          onPress={() => goTo(currentPage - 1)}
          style={[s.navBtn, isFirst && s.invisible]}
          disabled={isFirst}
        >
          <Text style={s.navBack}>← Back</Text>
        </Pressable>

        <View style={s.dots}>
          {PAGES.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View style={[s.dot, i === currentPage && s.dotActive]} />
            </Pressable>
          ))}
        </View>

        {!isLast ? (
          <Pressable onPress={() => goTo(currentPage + 1)} style={s.navBtn}>
            <Text style={s.navNext}>Next →</Text>
          </Pressable>
        ) : (
          <View style={s.navBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Screen-level styles ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  flex1: { flex: 1 },
  skipBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  pageWrap: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  navBtn: {
    minWidth: 72,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  invisible: { opacity: 0 },
  navBack: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  navNext: {
    fontSize: FontSize.sm,
    color: Colors.brand.light,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.border.default,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.brand.primary,
  },
});

// ─── Page-level styles ─────────────────────────────────────────────────────────

const p = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    gap: Spacing.md,
  },

  // ── Hero ──
  glowRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '10%',
    width: 220,
    height: 220,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.glow,
  },
  logoWrap: {
    alignSelf: 'center',
    position: 'relative',
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.6,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  logoDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bg.primary,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.brand.light,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headline: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 42,
  },
  subheadline: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  statVal: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.brand.light,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },

  // ── Shared feature page ──
  badge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.brand.light,
    letterSpacing: 1.5,
  },
  featureTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    lineHeight: 34,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
  },

  // ── Market page ──
  sparkCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  sparkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sparkName: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  sparkPrice: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },
  sparkUp: {
    color: Colors.success,
  },
  sparkBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 56,
    gap: 3,
  },
  sparkBar: {
    flex: 1,
    backgroundColor: Colors.brand.primary,
    borderRadius: 2,
    minHeight: 4,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  coinDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  coinSymbol: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    width: 36,
  },
  coinName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.muted,
  },
  coinPrice: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  coinChange: {
    fontSize: FontSize.sm,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    width: 50,
    textAlign: 'right',
  },

  // ── Wallet page ──
  walletCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    gap: Spacing.sm,
  },
  addressBox: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  addressLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    letterSpacing: 1,
    marginBottom: 2,
    fontWeight: FontWeight.bold,
  },
  addressText: {
    fontSize: FontSize.sm,
    color: Colors.brand.light,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  arrowDown: {
    textAlign: 'center',
    fontSize: 20,
    color: Colors.text.muted,
  },
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  holdingDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  holdingChain: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  holdingAmount: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  holdingValue: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    width: 60,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.default,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    letterSpacing: 1,
    fontWeight: FontWeight.bold,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.success,
  },

  // ── Offline page ──
  syncDiagram: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  syncBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  syncIcon: { fontSize: 32 },
  syncBoxLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  syncBoxSub: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  syncArrow: {
    fontSize: 22,
    color: Colors.text.muted,
  },
  statusList: {
    gap: Spacing.sm,
  },
  statusRow: {
    gap: 6,
  },
  statusMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
  },
  statusPct: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statusTrack: {
    height: 4,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  statusFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  // ── Networks page ──
  networkCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderLeftWidth: 3,
    gap: Spacing.xs,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  networkBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkSymbol: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  networkMeta: {
    flex: 1,
    gap: 2,
  },
  networkName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  networkStat: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  networkDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  // ── CTA page ──
  ctaContainer: {
    alignItems: 'center',
  },
  ctaGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '5%',
    width: 260,
    height: 260,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.glow,
  },
  ctaLogoMark: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    marginBottom: Spacing.xs,
  },
  ctaLogoLetter: {
    fontSize: 30,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
  ctaHeadline: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 42,
  },
  ctaSubheadline: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  ctaPrimary: {
    width: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaPrimaryText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  ctaSecondary: {
    width: '100%',
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.bg.elevated,
  },
  ctaSecondaryText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  pressed: { opacity: 0.8 },
  ctaFooter: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
