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

import { useAuth } from '@/src/shared/auth';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

function DemoNotice() {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.noticeTitle}>Demo mode only</Text>
      <Text style={styles.noticeText}>
        This login is frontend-only for testing. Credentials are stored locally on this device/browser and are not secure.
      </Text>
      <Text style={styles.noticeText}>Do not use real passwords or sensitive personal data.</Text>
    </View>
  );
}

export default function SignInScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);

    try {
      await signIn({ email, password });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
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
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>BlockApp</Text>
            <Text style={styles.tagline}>Prototype access for UI testing</Text>
          </View>

          <DemoNotice />

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your local demo account</Text>

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

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have a demo account? </Text>
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

function sanitizeAuthError(message: string): string {
  if (message.toLowerCase().includes('password')) return 'Incorrect email or password.';
  if (message.toLowerCase().includes('email')) return 'Incorrect email or password.';
  if (message.toLowerCase().includes('network')) return 'Connection error. Try again.';
  return 'Sign in failed. Please try again.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.md },
  brand: { alignItems: 'center', marginBottom: Spacing.lg },
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
  noticeBox: {
    backgroundColor: Colors.warningDim,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  noticeTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.warning },
  noticeText: { fontSize: FontSize.xs, lineHeight: 18, color: Colors.text.secondary },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  link: { fontSize: FontSize.sm, color: Colors.brand.light, fontWeight: FontWeight.semibold },
});
