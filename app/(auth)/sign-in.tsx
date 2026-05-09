import { useSSO } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSSO(strategy: 'oauth_google' | 'oauth_github') {
    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({ strategy });
      if (createdSessionId) {
        await ssoSetActive?.({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch {
      setError('Sign in failed. Please try again.');
    }
  }

  async function handleSignIn() {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed';
      // No exponemos detalles técnicos internos al usuario
      setError(sanitizeAuthError(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>BlockApp</Text>
            <Text style={styles.tagline}>Your on-chain portfolio, always with you</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.text.muted}
                secureTextEntry
                textContentType="password"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (loading || !email || !password) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignIn}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable
              style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed]}
              onPress={() => handleSSO('oauth_google')}
            >
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed]}
              onPress={() => handleSSO('oauth_github')}
            >
              <Text style={styles.socialIcon}>⌥</Text>
              <Text style={styles.socialLabel}>GitHub</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text style={styles.link}>Create one</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Sanitiza mensajes de error de Clerk para no exponer detalles técnicos internos
function sanitizeAuthError(message: string): string {
  if (message.toLowerCase().includes('password')) return 'Incorrect email or password.';
  if (message.toLowerCase().includes('identifier')) return 'Account not found.';
  if (message.toLowerCase().includes('network')) return 'Connection error. Try again.';
  return 'Sign in failed. Please try again.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.md },
  brand: { alignItems: 'center', marginBottom: Spacing.xl },
  logoMark: {
    width: 64, height: 64, borderRadius: Radius.lg,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.4, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logoText: { fontSize: 28, fontWeight: FontWeight.black, color: '#fff' },
  appName: { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: Colors.text.primary },
  tagline: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border.default,
    gap: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: -Spacing.sm },
  field: { gap: Spacing.xs },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bg.input,
    borderWidth: 1, borderColor: Colors.border.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.text.primary,
  },
  errorBox: {
    backgroundColor: Colors.dangerDim,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.danger + '33',
  },
  errorText: { fontSize: FontSize.sm, color: Colors.danger },
  button: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border.default },
  dividerText: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.medium },
  socialRow: { flexDirection: 'row', gap: Spacing.sm },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 13,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default,
  },
  socialBtnPressed: { opacity: 0.7 },
  socialIcon: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  socialLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  link: { fontSize: FontSize.sm, color: Colors.brand.light, fontWeight: FontWeight.semibold },
});
