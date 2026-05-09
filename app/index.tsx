import { useAuth } from '@clerk/expo';
import { Link, Redirect } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

const FEATURES = [
  {
    icon: '📈',
    title: 'Live Market Data',
    description: 'Real-time prices, 24h changes, and market cap for thousands of crypto assets powered by CoinGecko.',
  },
  {
    icon: '🔗',
    title: 'On-Chain Wallet Audit',
    description: 'Connect any public wallet address and get a full breakdown of your on-chain holdings across networks.',
  },
  {
    icon: '⚡',
    title: 'Offline First',
    description: 'Your portfolio data is stored locally. Browse your holdings even without an internet connection.',
  },
] as const;

export default function LandingScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
            <View style={styles.logoDot} />
          </View>

          <Text style={styles.appName}>BlockApp</Text>

          <Text style={styles.headline}>
            Your crypto portfolio,{'\n'}always with you
          </Text>

          <Text style={styles.subheadline}>
            Track prices, audit wallets, and monitor your on-chain assets — all in one place, even offline.
          </Text>

          <Link href="/sign-up" asChild>
            <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}>
              <Text style={styles.ctaPrimaryText}>Get Started — it's free</Text>
            </Pressable>
          </Link>

          <Link href="/sign-in" asChild>
            <Pressable style={({ pressed }) => [styles.ctaSecondary, pressed && styles.pressed]}>
              <Text style={styles.ctaSecondaryText}>I already have an account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>WHY BLOCKAPP</Text>

          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Supported chains */}
        <View style={styles.chainsSection}>
          <Text style={styles.sectionLabel}>SUPPORTED NETWORKS</Text>
          <View style={styles.chainsRow}>
            <View style={styles.chainPill}>
              <View style={[styles.chainDot, { backgroundColor: Colors.chain.bitcoin }]} />
              <Text style={styles.chainLabel}>Bitcoin</Text>
            </View>
            <View style={styles.chainPill}>
              <View style={[styles.chainDot, { backgroundColor: Colors.chain.ethereum }]} />
              <Text style={styles.chainLabel}>Ethereum</Text>
            </View>
            <View style={styles.chainPill}>
              <View style={[styles.chainDot, { backgroundColor: Colors.chain.solana }]} />
              <Text style={styles.chainLabel}>Solana</Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Text style={styles.bottomCtaText}>
            Ready to take control of your portfolio?
          </Text>
          <Link href="/sign-up" asChild>
            <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}>
              <Text style={styles.ctaPrimaryText}>Create free account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with ❤️ for the on-chain community
          </Text>
          <Text style={styles.footerText}>
            Market data by CoinGecko · Chain data by Blockchair
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
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
    marginBottom: Spacing.lg,
  },
  headline: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  subheadline: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: Spacing.xl,
  },
  ctaPrimary: {
    width: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
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
  pressed: {
    opacity: 0.8,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.default,
    marginVertical: Spacing.xl,
  },

  // Features
  featuresSection: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.muted,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand.dim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureBody: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  // Chains
  chainsSection: {
    gap: Spacing.md,
  },
  chainsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  chainLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },

  // Bottom CTA
  bottomCta: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  bottomCtaText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
