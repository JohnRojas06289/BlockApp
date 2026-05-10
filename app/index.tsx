import { useAuth } from '@clerk/expo';
import { Link, Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

// ─── Datos mock ────────────────────────────────────────────────────────────────

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

const FEATURES = [
  {
    icon: '📈',
    title: 'Datos de mercado en vivo',
    desc: 'Precios en tiempo real, cambios en 24h y capitalización de mercado para miles de activos cripto, impulsado por CoinGecko.',
  },
  {
    icon: '🔗',
    title: 'Auditoría de wallets on-chain',
    desc: 'Conecta cualquier dirección pública y obtén un desglose completo de tus holdings en todas las redes soportadas.',
  },
  {
    icon: '⚡',
    title: 'Primero sin conexión',
    desc: 'Tus datos se almacenan localmente con SQLite. Consulta tu portafolio incluso sin acceso a internet.',
  },
] as const;

const NETWORKS = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: Colors.chain.bitcoin,
    stat: '+420M direcciones',
    desc: 'La blockchain original. Audita cualquier wallet BTC al instante.',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    color: Colors.chain.ethereum,
    stat: '+250M wallets',
    desc: 'Soporte completo de tokens ERC-20 en mainnet y L2.',
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    color: Colors.chain.solana,
    stat: '+150M cuentas',
    desc: 'Soporte de tokens SPL con obtención de datos ultrarrápida.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WEB LANDING
// ═══════════════════════════════════════════════════════════════════════════════

function WebLanding() {
  const scrollRef = useRef<ScrollView>(null);
  const sectionYs = useRef<Record<string, number>>({});

  const scrollTo = (key: string) =>
    scrollRef.current?.scrollTo({ y: sectionYs.current[key] ?? 0, animated: true });

  return (
    <View style={w.root}>

      {/* ── Navbar ── */}
      <View style={w.navbar}>
        <View style={w.navInner}>

          <View style={w.navLogo}>
            <View style={w.navLogoMark}>
              <Text style={w.navLogoLetter}>B</Text>
            </View>
            <Text style={w.navLogoText}>BlockApp</Text>
          </View>

          <View style={w.navLinks}>
            {([
              ['Características', 'features'],
              ['Mercado',         'market'],
              ['Redes',           'networks'],
            ] as const).map(([label, key]) => (
              <Pressable
                key={key}
                onPress={() => scrollTo(key)}
                style={({ pressed }) => [w.navLink, pressed && w.pressed]}
              >
                <Text style={w.navLinkText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={w.navCtas}>
            <Link href="/sign-in" asChild>
              <Pressable style={({ pressed }) => [w.navGhost, pressed && w.pressed]}>
                <Text style={w.navGhostText}>Iniciar sesión</Text>
              </Pressable>
            </Link>
            <Link href="/sign-up" asChild>
              <Pressable style={({ pressed }) => [w.navPrimary, pressed && w.pressed]}>
                <Text style={w.navPrimaryText}>Comenzar gratis</Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </View>

      <ScrollView ref={scrollRef} style={w.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={w.hero}>
          <View style={w.heroGlow} />
          <View style={w.heroContent}>
            <View style={w.badge}>
              <View style={w.badgeDot} />
              <Text style={w.badgeText}>PORTAFOLIO CRIPTO · MULTI-CADENA</Text>
            </View>

            <Text style={w.heroHeadline}>
              Tu portafolio cripto,{'\n'}siempre contigo
            </Text>

            <Text style={w.heroSub}>
              Rastrea precios en tiempo real, audita wallets on-chain y monitorea
              tus activos — todo en un solo lugar, incluso sin conexión a internet.
            </Text>

            <View style={w.heroCtas}>
              <Link href="/sign-up" asChild>
                <Pressable style={({ pressed }) => [w.btnPrimary, pressed && w.pressed]}>
                  <Text style={w.btnPrimaryText}>Comenzar gratis →</Text>
                </Pressable>
              </Link>
              <Link href="/sign-in" asChild>
                <Pressable style={({ pressed }) => [w.btnOutline, pressed && w.pressed]}>
                  <Text style={w.btnOutlineText}>Ya tengo cuenta</Text>
                </Pressable>
              </Link>
            </View>

            <View style={w.heroStats}>
              {([
                ['3',      'Redes soportadas'],
                ['10,000+','Activos rastreados'],
                ['100%',   'Funciona offline'],
              ] as const).map(([val, label], i, arr) => (
                <View
                  key={label}
                  style={[w.heroStat, i < arr.length - 1 && w.heroStatBorder]}
                >
                  <Text style={w.heroStatVal}>{val}</Text>
                  <Text style={w.heroStatLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Características ── */}
        <View
          style={w.section}
          onLayout={(e) => { sectionYs.current.features = e.nativeEvent.layout.y; }}
        >
          <View style={w.inner}>
            <Text style={w.sectionBadge}>POR QUÉ BLOCKAPP</Text>
            <Text style={w.sectionTitle}>
              Todo lo que necesitas para{'\n'}gestionar tu portafolio cripto
            </Text>
            <View style={w.featuresGrid}>
              {FEATURES.map((f) => (
                <View key={f.title} style={w.featureCard}>
                  <View style={w.featureIconWrap}>
                    <Text style={w.featureIcon}>{f.icon}</Text>
                  </View>
                  <Text style={w.featureTitle}>{f.title}</Text>
                  <Text style={w.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Mercado en vivo ── */}
        <View
          style={[w.section, w.sectionAlt]}
          onLayout={(e) => { sectionYs.current.market = e.nativeEvent.layout.y; }}
        >
          <View style={w.inner}>
            <View style={w.twoCol}>

              <View style={w.colText}>
                <Text style={w.sectionBadge}>DATOS EN TIEMPO REAL</Text>
                <Text style={w.sectionTitle}>
                  Sabe lo que hace{'\n'}el mercado. Siempre.
                </Text>
                <Text style={w.sectionDesc}>
                  Precios en tiempo real, cambios en 24 horas y capitalización de
                  mercado para miles de activos, impulsados por la API de CoinGecko.
                </Text>
              </View>

              <View style={w.colVisual}>
                <View style={w.sparkCard}>
                  <View style={w.sparkHeader}>
                    <Text style={w.sparkName}>Bitcoin (BTC)</Text>
                    <Text style={w.sparkPrice}>
                      $67,240{'  '}<Text style={w.up}>+2.4%</Text>
                    </Text>
                  </View>
                  <View style={w.sparkBars}>
                    {SPARK.map((h, i) => (
                      <View
                        key={i}
                        style={[
                          w.sparkBar,
                          { height: (h / 100) * 72, opacity: 0.3 + (i / SPARK.length) * 0.7 },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                {COINS.map((c) => (
                  <View key={c.symbol} style={w.coinRow}>
                    <View style={[w.dot, { backgroundColor: c.color }]} />
                    <Text style={w.coinSymbol}>{c.symbol}</Text>
                    <Text style={w.coinName}>{c.name}</Text>
                    <Text style={w.coinPrice}>{c.price}</Text>
                    <Text style={w.coinChange}>{c.change}</Text>
                  </View>
                ))}
              </View>

            </View>
          </View>
        </View>

        {/* ── Auditoría de wallets ── */}
        <View style={w.section}>
          <View style={w.inner}>
            <View style={[w.twoCol, { flexDirection: 'row-reverse' }]}>

              <View style={w.colText}>
                <Text style={w.sectionBadge}>AUDITORÍA ON-CHAIN</Text>
                <Text style={w.sectionTitle}>
                  Tu portafolio on-chain{'\n'}completo, al instante.
                </Text>
                <Text style={w.sectionDesc}>
                  Pega cualquier dirección pública y obtén un desglose detallado de
                  tus holdings en todas las redes. Sin conectar tu wallet, sin riesgos.
                </Text>
              </View>

              <View style={w.colVisual}>
                <View style={w.walletCard}>
                  <View style={w.addressBox}>
                    <Text style={w.addressLabel}>DIRECCIÓN DE WALLET</Text>
                    <Text style={w.addressText}>0x1A2b3C4d...8F3d</Text>
                  </View>
                  <Text style={w.arrowDown}>↓</Text>
                  {HOLDINGS.map((h) => (
                    <View key={h.chain} style={w.holdingRow}>
                      <View style={[w.dot, { backgroundColor: h.color }]} />
                      <Text style={w.holdingChain}>{h.chain}</Text>
                      <Text style={w.holdingAmount}>{h.amount}</Text>
                      <Text style={w.holdingValue}>{h.value}</Text>
                    </View>
                  ))}
                  <View style={w.totalRow}>
                    <Text style={w.totalLabel}>VALOR TOTAL</Text>
                    <Text style={w.totalValue}>$22,640</Text>
                  </View>
                </View>
              </View>

            </View>
          </View>
        </View>

        {/* ── Redes ── */}
        <View
          style={[w.section, w.sectionAlt]}
          onLayout={(e) => { sectionYs.current.networks = e.nativeEvent.layout.y; }}
        >
          <View style={w.inner}>
            <Text style={[w.sectionBadge, w.centered]}>REDES SOPORTADAS</Text>
            <Text style={[w.sectionTitle, w.centered]}>
              Multi-cadena desde el primer día
            </Text>
            <View style={w.networksGrid}>
              {NETWORKS.map((n) => (
                <View key={n.name} style={[w.networkCard, { borderTopColor: n.color }]}>
                  <View style={[w.networkBadge, { backgroundColor: n.color + '22' }]}>
                    <Text style={[w.networkSymbol, { color: n.color }]}>{n.symbol}</Text>
                  </View>
                  <Text style={w.networkName}>{n.name}</Text>
                  <Text style={w.networkStat}>{n.stat}</Text>
                  <Text style={w.networkDesc}>{n.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── CTA final ── */}
        <View style={w.ctaSection}>
          <View style={w.ctaGlow} />
          <View style={w.ctaInner}>
            <Text style={w.ctaHeadline}>¿Listo para tomar{'\n'}el control?</Text>
            <Text style={w.ctaSub}>
              Únete a miles de usuarios cripto que gestionan su portafolio on-chain con BlockApp.
            </Text>
            <View style={w.heroCtas}>
              <Link href="/sign-up" asChild>
                <Pressable style={({ pressed }) => [w.btnPrimary, pressed && w.pressed]}>
                  <Text style={w.btnPrimaryText}>Crear cuenta gratis</Text>
                </Pressable>
              </Link>
              <Link href="/sign-in" asChild>
                <Pressable style={({ pressed }) => [w.btnOutline, pressed && w.pressed]}>
                  <Text style={w.btnOutlineText}>Ya tengo cuenta</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={w.footer}>
          <View style={w.footerInner}>
            <View style={w.footerLogo}>
              <View style={w.footerLogoMark}>
                <Text style={w.footerLogoLetter}>B</Text>
              </View>
              <Text style={w.footerLogoText}>BlockApp</Text>
            </View>
            <Text style={w.footerLine}>
              Datos de mercado por CoinGecko · Datos on-chain por Blockchair
            </Text>
            <Text style={w.footerCopy}>© 2026 BlockApp. Todos los derechos reservados.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NATIVE LANDING (paginado)
// ═══════════════════════════════════════════════════════════════════════════════

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
      <Text style={p.headline}>{'Tu portafolio cripto,\nsiempre contigo'}</Text>
      <Text style={p.subheadline}>
        Rastrea precios, audita wallets y monitorea tus activos on-chain — todo en un solo lugar, incluso sin conexión.
      </Text>
      <View style={p.statsRow}>
        {([['3', 'Redes'], ['10K+', 'Activos'], ['100%', 'Offline']] as const).map(
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
      <Text style={p.badge}>DATOS EN TIEMPO REAL</Text>
      <Text style={p.featureTitle}>{'Sabe lo que hace\nel mercado. Siempre.'}</Text>
      <Text style={p.featureDesc}>
        Precios en tiempo real, cambios en 24h y capitalización de mercado para miles de activos cripto, impulsado por CoinGecko.
      </Text>
      <View style={p.sparkCard}>
        <View style={p.sparkHeader}>
          <Text style={p.sparkName}>Bitcoin (BTC)</Text>
          <Text style={p.sparkPrice}>$67,240{'  '}<Text style={p.sparkUp}>+2.4%</Text></Text>
        </View>
        <View style={p.sparkBars}>
          {SPARK.map((h, i) => (
            <View
              key={i}
              style={[p.sparkBar, { height: (h / 100) * 56, opacity: 0.35 + (i / SPARK.length) * 0.65 }]}
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
      <Text style={p.badge}>AUDITORÍA ON-CHAIN</Text>
      <Text style={p.featureTitle}>{'Tu portafolio on-chain\ncompleto, al instante.'}</Text>
      <Text style={p.featureDesc}>
        Pega cualquier dirección pública y obtén un desglose completo de tus holdings en todas las redes soportadas.
      </Text>
      <View style={p.walletCard}>
        <View style={p.addressBox}>
          <Text style={p.addressLabel}>DIRECCIÓN DE WALLET</Text>
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
          <Text style={p.totalLabel}>VALOR TOTAL</Text>
          <Text style={p.totalValue}>$22,640</Text>
        </View>
      </View>
    </View>
  );
}

function PageOffline() {
  const bars = [
    { label: 'Caché local',       pct: 1,    color: Colors.success },
    { label: 'Precios de mercado', pct: 0.85, color: Colors.brand.primary },
    { label: 'Datos de wallet',   pct: 0.72, color: Colors.chain.solana },
  ] as const;

  return (
    <View style={p.container}>
      <Text style={p.badge}>PRIMERO SIN CONEXIÓN</Text>
      <Text style={p.featureTitle}>{'Tus datos.\nSiempre disponibles.'}</Text>
      <Text style={p.featureDesc}>
        Tu portafolio se almacena localmente con SQLite. Consulta y audita tus holdings incluso sin conexión a internet.
      </Text>
      <View style={p.syncDiagram}>
        <View style={p.syncBox}>
          <Text style={p.syncIcon}>📱</Text>
          <Text style={p.syncBoxLabel}>Dispositivo</Text>
          <Text style={p.syncBoxSub}>SQLite</Text>
        </View>
        <Text style={p.syncArrow}>↔</Text>
        <View style={p.syncBox}>
          <Text style={p.syncIcon}>☁️</Text>
          <Text style={p.syncBoxLabel}>Nube</Text>
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
              <View style={[p.statusFill, { width: `${pct * 100}%` as `${number}%`, backgroundColor: color }]} />
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
      <Text style={p.badge}>REDES SOPORTADAS</Text>
      <Text style={p.featureTitle}>{'Multi-cadena\ndesde el primer día.'}</Text>
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
      <Text style={p.ctaHeadline}>{'¿Listo para tomar\nel control?'}</Text>
      <Text style={p.ctaSubheadline}>
        Únete a miles de usuarios cripto que gestionan su portafolio on-chain con BlockApp.
      </Text>
      <Link href="/sign-up" asChild>
        <Pressable style={({ pressed }) => [p.ctaPrimary, pressed && p.pressed]}>
          <Text style={p.ctaPrimaryText}>Crear cuenta gratis</Text>
        </Pressable>
      </Link>
      <Link href="/sign-in" asChild>
        <Pressable style={({ pressed }) => [p.ctaSecondary, pressed && p.pressed]}>
          <Text style={p.ctaSecondaryText}>Ya tengo cuenta</Text>
        </Pressable>
      </Link>
      <Text style={p.ctaFooter}>Datos de mercado por CoinGecko · On-chain por Blockchair</Text>
    </View>
  );
}

const PAGES: React.ComponentType[] = [
  PageHero, PageMarket, PageWallet, PageOffline, PageNetworks, PageCTA,
];

function NativeLanding() {
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (index: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentPage(index);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const isFirst = currentPage === 0;
  const isLast  = currentPage === PAGES.length - 1;
  const ActivePage = PAGES[currentPage];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <View style={s.flex1} />
        {!isLast && (
          <Pressable onPress={() => goTo(PAGES.length - 1)} style={s.skipBtn}>
            <Text style={s.skipText}>Saltar</Text>
          </Pressable>
        )}
      </View>

      <Animated.View style={[s.pageWrap, { opacity: fadeAnim }]}>
        <ActivePage />
      </Animated.View>

      <View style={s.bottomNav}>
        <Pressable
          onPress={() => goTo(currentPage - 1)}
          style={[s.navBtn, isFirst && s.invisible]}
          disabled={isFirst}
        >
          <Text style={s.navBack}>← Atrás</Text>
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
            <Text style={s.navNext}>Siguiente →</Text>
          </Pressable>
        ) : (
          <View style={s.navBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Export principal ──────────────────────────────────────────────────────────

export default function LandingScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) return <Redirect href="/(tabs)" />;

  if (Platform.OS === 'web') return <WebLanding />;
  return <NativeLanding />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — WEB
// ═══════════════════════════════════════════════════════════════════════════════

const w = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },

  // Navbar
  navbar: {
    height: 64,
    backgroundColor: Colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
    justifyContent: 'center',
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  navLogo:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogoMark:   { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  navLogoLetter: { fontSize: 16, fontWeight: FontWeight.black, color: '#fff' },
  navLogoText:   { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.text.primary, letterSpacing: 0.5 },
  navLinks:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  navLink:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  navLinkText:   { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  navCtas:       { flexDirection: 'row', gap: 8 },
  navGhost:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm },
  navGhostText:  { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  navPrimary:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm, backgroundColor: Colors.brand.primary },
  navPrimaryText:{ fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.bold },

  scroll: { flex: 1 },

  // Hero
  hero: { paddingTop: 96, paddingBottom: 80, alignItems: 'center', overflow: 'hidden' },
  heroGlow: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 700,
    height: 400,
    borderRadius: 9999,
    backgroundColor: Colors.brand.glow,
  },
  heroContent: { alignItems: 'center', maxWidth: 720, width: '100%', paddingHorizontal: 24, gap: 24 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.brand.dim, borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: Colors.brand.primary + '55' },
  badgeDot:    { width: 6, height: 6, borderRadius: 9999, backgroundColor: Colors.success },
  badgeText:   { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.brand.light, letterSpacing: 1.5 },
  heroHeadline:{ fontSize: 52, fontWeight: FontWeight.black, color: Colors.text.primary, textAlign: 'center', lineHeight: 64 },
  heroSub:     { fontSize: 18, color: Colors.text.secondary, textAlign: 'center', lineHeight: 30, maxWidth: 560 },
  heroCtas:    { flexDirection: 'row', gap: 12 },
  heroStats:   { flexDirection: 'row', borderWidth: 1, borderColor: Colors.border.default, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, overflow: 'hidden', marginTop: 8 },
  heroStat:    { flex: 1, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  heroStatBorder: { borderRightWidth: 1, borderRightColor: Colors.border.default },
  heroStatVal: { fontSize: 28, fontWeight: FontWeight.black, color: Colors.brand.light },
  heroStatLabel:{ fontSize: 12, color: Colors.text.muted, marginTop: 4 },

  // Botones compartidos
  btnPrimary:     { paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.brand.primary, shadowColor: Colors.brand.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  btnPrimaryText: { fontSize: 16, color: '#fff', fontWeight: FontWeight.bold },
  btnOutline:     { paddingHorizontal: 24, paddingVertical: 13, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, backgroundColor: Colors.bg.elevated },
  btnOutlineText: { fontSize: 16, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  pressed: { opacity: 0.8 },

  // Secciones
  section:    { paddingVertical: 80 },
  sectionAlt: { backgroundColor: Colors.bg.secondary },
  inner:      { maxWidth: 1100, alignSelf: 'center', width: '100%', paddingHorizontal: 32, gap: 16 },
  sectionBadge:  { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.brand.light, letterSpacing: 1.5 },
  sectionTitle:  { fontSize: 36, fontWeight: FontWeight.black, color: Colors.text.primary, lineHeight: 46 },
  sectionDesc:   { fontSize: 16, color: Colors.text.secondary, lineHeight: 28 },
  centered:      { textAlign: 'center', alignSelf: 'center' },

  // Features grid
  featuresGrid: { flexDirection: 'row', gap: 20, marginTop: 40, flexWrap: 'wrap' },
  featureCard:  { flex: 1, minWidth: 240, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: 28, borderWidth: 1, borderColor: Colors.border.default, gap: 12 },
  featureIconWrap: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.brand.dim, alignItems: 'center', justifyContent: 'center' },
  featureIcon:  { fontSize: 22 },
  featureTitle: { fontSize: 18, fontWeight: FontWeight.bold, color: Colors.text.primary },
  featureDesc:  { fontSize: 14, color: Colors.text.secondary, lineHeight: 22 },

  // 2 columnas
  twoCol:   { flexDirection: 'row', gap: 64, alignItems: 'center' },
  colText:  { flex: 1, gap: 16 },
  colVisual:{ flex: 1, gap: 12 },

  // Sparkline
  sparkCard:  { backgroundColor: Colors.bg.elevated, borderRadius: Radius.lg, padding: 20, borderWidth: 1, borderColor: Colors.border.default, marginBottom: 4 },
  sparkHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sparkName:  { fontSize: 13, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  sparkPrice: { fontSize: 13, color: Colors.text.primary, fontWeight: FontWeight.bold },
  up:         { color: Colors.success },
  sparkBars:  { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 4 },
  sparkBar:   { flex: 1, backgroundColor: Colors.brand.primary, borderRadius: 2, minHeight: 4 },

  // Coins
  coinRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bg.elevated, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border.subtle },
  dot:        { width: 8, height: 8, borderRadius: 9999 },
  coinSymbol: { fontSize: 13, fontWeight: FontWeight.black, color: Colors.text.primary, width: 40 },
  coinName:   { flex: 1, fontSize: 13, color: Colors.text.muted },
  coinPrice:  { fontSize: 13, color: Colors.text.primary, fontWeight: FontWeight.medium },
  coinChange: { fontSize: 13, color: Colors.success, fontWeight: FontWeight.bold, width: 52, textAlign: 'right' },

  // Wallet
  walletCard: { backgroundColor: Colors.bg.elevated, borderRadius: Radius.lg, padding: 20, borderWidth: 1, borderColor: Colors.border.default, gap: 10 },
  addressBox: { backgroundColor: Colors.bg.card, borderRadius: Radius.sm, padding: 12, borderWidth: 1, borderColor: Colors.border.default },
  addressLabel:{ fontSize: 10, color: Colors.text.muted, letterSpacing: 1, fontWeight: FontWeight.bold, marginBottom: 4 },
  addressText:{ fontSize: 13, color: Colors.brand.light, fontWeight: FontWeight.medium, letterSpacing: 0.5 },
  arrowDown:  { textAlign: 'center', fontSize: 20, color: Colors.text.muted },
  holdingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  holdingChain:{ flex: 1, fontSize: 13, color: Colors.text.secondary },
  holdingAmount:{ fontSize: 13, color: Colors.text.primary, fontWeight: FontWeight.medium },
  holdingValue:{ fontSize: 13, color: Colors.text.muted, width: 64, textAlign: 'right' },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border.default, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 10, color: Colors.text.muted, letterSpacing: 1, fontWeight: FontWeight.bold },
  totalValue: { fontSize: 20, fontWeight: FontWeight.black, color: Colors.success },

  // Networks
  networksGrid:  { flexDirection: 'row', gap: 20, marginTop: 40, flexWrap: 'wrap' },
  networkCard:   { flex: 1, minWidth: 240, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: 24, borderWidth: 1, borderColor: Colors.border.default, borderTopWidth: 3, gap: 10 },
  networkBadge:  { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  networkSymbol: { fontSize: 16, fontWeight: FontWeight.black },
  networkName:   { fontSize: 20, fontWeight: FontWeight.bold, color: Colors.text.primary },
  networkStat:   { fontSize: 12, color: Colors.text.muted },
  networkDesc:   { fontSize: 13, color: Colors.text.secondary, lineHeight: 20 },

  // CTA final
  ctaSection: { paddingVertical: 100, alignItems: 'center', overflow: 'hidden' },
  ctaGlow:    { position: 'absolute', alignSelf: 'center', width: 700, height: 400, borderRadius: 9999, backgroundColor: Colors.brand.glow },
  ctaInner:   { alignItems: 'center', maxWidth: 600, width: '100%', paddingHorizontal: 24, gap: 20 },
  ctaHeadline:{ fontSize: 48, fontWeight: FontWeight.black, color: Colors.text.primary, textAlign: 'center', lineHeight: 60 },
  ctaSub:     { fontSize: 18, color: Colors.text.secondary, textAlign: 'center', lineHeight: 28 },

  // Footer
  footer:         { backgroundColor: Colors.bg.secondary, borderTopWidth: 1, borderTopColor: Colors.border.default, paddingVertical: 36 },
  footerInner:    { maxWidth: 1100, alignSelf: 'center', width: '100%', paddingHorizontal: 32, alignItems: 'center', gap: 10 },
  footerLogo:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLogoMark: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  footerLogoLetter:{ fontSize: 14, fontWeight: FontWeight.black, color: '#fff' },
  footerLogoText: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.text.primary },
  footerLine:     { fontSize: 12, color: Colors.text.muted, textAlign: 'center' },
  footerCopy:     { fontSize: 11, color: Colors.text.muted, opacity: 0.5 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — NATIVE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg.primary },
  topBar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, height: 44 },
  flex1:   { flex: 1 },
  skipBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  skipText:{ fontSize: FontSize.sm, color: Colors.text.muted, fontWeight: FontWeight.medium },
  pageWrap:{ flex: 1 },
  bottomNav:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  navBtn:  { minWidth: 80, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xs },
  invisible:{ opacity: 0 },
  navBack: { fontSize: FontSize.sm, color: Colors.text.muted, fontWeight: FontWeight.medium },
  navNext: { fontSize: FontSize.sm, color: Colors.brand.light, fontWeight: FontWeight.bold, textAlign: 'right' },
  dots:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:     { width: 6, height: 6, borderRadius: Radius.full, backgroundColor: Colors.border.default },
  dotActive:{ width: 22, backgroundColor: Colors.brand.primary },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — NATIVE PAGES
// ═══════════════════════════════════════════════════════════════════════════════

const p = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'center', gap: Spacing.md },

  // Hero
  glowRing:    { position: 'absolute', alignSelf: 'center', top: '10%', width: 220, height: 220, borderRadius: Radius.full, backgroundColor: Colors.brand.glow },
  logoWrap:    { alignSelf: 'center', position: 'relative' },
  logoMark:    { width: 80, height: 80, borderRadius: Radius.xl, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.brand.primary, shadowOpacity: 0.6, shadowRadius: 28, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  logoLetter:  { fontSize: 36, fontWeight: FontWeight.black, color: '#fff' },
  logoDot:     { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: Radius.full, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.bg.primary },
  appName:     { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.light, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },
  headline:    { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary, textAlign: 'center', lineHeight: 42 },
  subheadline: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  statsRow:    { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  statBox:     { flex: 1, alignItems: 'center', backgroundColor: Colors.bg.card, borderRadius: Radius.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border.default },
  statVal:     { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.brand.light },
  statLabel:   { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },

  // Compartido
  badge:       { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.brand.light, letterSpacing: 1.5 },
  featureTitle:{ fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.text.primary, lineHeight: 34 },
  featureDesc: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 22 },

  // Market
  sparkCard:  { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.default },
  sparkHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sparkName:  { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  sparkPrice: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.bold },
  sparkUp:    { color: Colors.success },
  sparkBars:  { flexDirection: 'row', alignItems: 'flex-end', height: 56, gap: 3 },
  sparkBar:   { flex: 1, backgroundColor: Colors.brand.primary, borderRadius: 2, minHeight: 4 },
  coinRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bg.card, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border.subtle },
  coinDot:    { width: 8, height: 8, borderRadius: Radius.full },
  coinSymbol: { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: Colors.text.primary, width: 36 },
  coinName:   { flex: 1, fontSize: FontSize.sm, color: Colors.text.muted },
  coinPrice:  { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },
  coinChange: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.bold, width: 50, textAlign: 'right' },

  // Wallet
  walletCard:  { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.default, gap: Spacing.sm },
  addressBox:  { backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border.default },
  addressLabel:{ fontSize: FontSize.xs, color: Colors.text.muted, letterSpacing: 1, marginBottom: 2, fontWeight: FontWeight.bold },
  addressText: { fontSize: FontSize.sm, color: Colors.brand.light, fontWeight: FontWeight.medium, letterSpacing: 0.5 },
  arrowDown:   { textAlign: 'center', fontSize: 20, color: Colors.text.muted },
  holdingRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  holdingDot:  { width: 8, height: 8, borderRadius: Radius.full },
  holdingChain:{ flex: 1, fontSize: FontSize.sm, color: Colors.text.secondary },
  holdingAmount:{ fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },
  holdingValue:{ fontSize: FontSize.sm, color: Colors.text.muted, width: 60, textAlign: 'right' },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border.default, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  totalLabel:  { fontSize: FontSize.xs, color: Colors.text.muted, letterSpacing: 1, fontWeight: FontWeight.bold },
  totalValue:  { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: Colors.success },

  // Offline
  syncDiagram: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.default },
  syncBox:     { flex: 1, alignItems: 'center', gap: 4 },
  syncIcon:    { fontSize: 32 },
  syncBoxLabel:{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary },
  syncBoxSub:  { fontSize: FontSize.xs, color: Colors.text.muted },
  syncArrow:   { fontSize: 22, color: Colors.text.muted },
  statusList:  { gap: Spacing.sm },
  statusRow:   { gap: 6 },
  statusMeta:  { flexDirection: 'row', justifyContent: 'space-between' },
  statusLabel: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.medium },
  statusPct:   { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statusTrack: { height: 4, backgroundColor: Colors.bg.elevated, borderRadius: Radius.full, overflow: 'hidden' },
  statusFill:  { height: '100%', borderRadius: Radius.full },

  // Networks
  networkCard:  { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle, borderLeftWidth: 3, gap: Spacing.xs },
  networkHeader:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  networkBadge: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  networkSymbol:{ fontSize: FontSize.sm, fontWeight: FontWeight.black },
  networkMeta:  { flex: 1, gap: 2 },
  networkName:  { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  networkStat:  { fontSize: FontSize.xs, color: Colors.text.muted },
  networkDesc:  { fontSize: FontSize.xs, color: Colors.text.secondary, lineHeight: 18 },

  // CTA page
  ctaContainer:   { alignItems: 'center' },
  ctaGlow:        { position: 'absolute', alignSelf: 'center', top: '5%', width: 260, height: 260, borderRadius: Radius.full, backgroundColor: Colors.brand.glow },
  ctaLogoMark:    { width: 72, height: 72, borderRadius: Radius.xl, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.brand.primary, shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 6 }, elevation: 12, marginBottom: Spacing.xs },
  ctaLogoLetter:  { fontSize: 30, fontWeight: FontWeight.black, color: '#fff' },
  ctaHeadline:    { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary, textAlign: 'center', lineHeight: 42 },
  ctaSubheadline: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
  ctaPrimary:     { width: '100%', backgroundColor: Colors.brand.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.brand.primary, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  ctaPrimaryText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  ctaSecondary:   { width: '100%', borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: Colors.border.default, backgroundColor: Colors.bg.elevated },
  ctaSecondaryText:{ color: Colors.text.secondary, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  pressed:        { opacity: 0.8 },
  ctaFooter:      { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', marginTop: Spacing.xs },
});
