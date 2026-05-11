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
      <Text style={styles.noticeTitle}>Prototype account system</Text>
      <Text style={styles.noticeText}>
        This sign-up only creates a local frontend account for demo purposes. It is not backed by a secure server.
      </Text>
      <Text style={styles.noticeText}>Do not use real passwords or sensitive personal data.</Text>
    </View>
  );
}

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    setLoading(true);

    try {
      await signUp({ firstName, email, password });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      setError(sanitizeAuthError(err instanceof Error ? err.message : ''));
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
            <Text style={styles.tagline}>Create a local demo account</Text>
          </View>

          <DemoNotice />

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Stored only on this device/browser</Text>

            <View style={styles.field}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Satoshi"
                placeholderTextColor={Colors.text.muted}
                textContentType="givenName"
                autoComplete="given-name"
              />
            </View>

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
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.text.muted}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
                passwordRules="minlength: 8;"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
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
                (loading || !email || !password || !firstName) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignUp}
              disabled={loading || !email || !password || !firstName}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </Pressable>

            <Text style={styles.legal}>
              Demo only: this account exists only on your current browser/device and can be cleared at any time.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have a demo account? </Text>
            <Link href="/sign-in" asChild>
              <Pressable>
                <Text style={styles.link}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function sanitizeAuthError(message: string): string {
  if (message.toLowerCase().includes('email')) return 'This email is already registered.';
  if (message.toLowerCase().includes('password')) return 'Password must be at least 8 characters.';
  if (message.toLowerCase().includes('first name')) return 'First name is required.';
  if (message.toLowerCase().includes('network')) return 'Connection error. Try again.';
  return 'Sign up failed. Please try again.';
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
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
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
    backgroundColor: Colors.bg.card, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.default, gap: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: -Spacing.sm },
  field: { gap: Spacing.xs },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bg.input, borderWidth: 1, borderColor: Colors.border.default,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.text.primary,
  },
  errorBox: {
    backgroundColor: Colors.dangerDim, borderRadius: Radius.sm,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.danger + '33',
  },
  errorText: { fontSize: FontSize.sm, color: Colors.danger },
  button: {
    backgroundColor: Colors.brand.primary, borderRadius: Radius.md,
    paddingVertical: 15, alignItems: 'center', marginTop: Spacing.xs,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  legal: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  link: { fontSize: FontSize.sm, color: Colors.brand.light, fontWeight: FontWeight.semibold },
});
