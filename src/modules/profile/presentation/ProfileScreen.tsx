import { useAuth, useUser } from '@/src/shared/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ label, value, onPress, rightElement, danger }: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setBiometricAvailable);
  }, []);

  async function handleToggleBiometric(value: boolean) {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) setBiometricEnabled(true);
    } else {
      setBiometricEnabled(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  }

  function handleClearCache() {
    Alert.alert(
      'Clear Cache',
      'This will remove all locally cached market and wallet data. Your account is not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ],
    );
  }

  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? 'User';
  const email = user?.emailAddresses[0]?.emailAddress ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={styles.section}>
          {biometricAvailable && (
            <SettingRow
              label="Biometric Lock"
              rightElement={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: Colors.border.default, true: Colors.brand.primary }}
                  thumbColor="#fff"
                />
              }
            />
          )}
          <SettingRow
            label="Auto-lock Timeout"
            value="5 minutes"
            onPress={() => {}}
          />
          <SettingRow
            label="Active Sessions"
            value="1 device"
            onPress={() => {}}
          />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingRow label="Currency" value="USD" onPress={() => {}} />
          <SettingRow label="Default Network" value="Ethereum" onPress={() => {}} />
          <SettingRow label="Price Alerts" value="Off" onPress={() => {}} />
          <SettingRow label="Theme" value="Dark" onPress={() => {}} />
        </View>

        {/* Data */}
        <SectionHeader title="Data" />
        <View style={styles.section}>
          <SettingRow label="Clear Cache" onPress={handleClearCache} />
          <SettingRow label="Export History" onPress={() => {}} />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow label="Terms of Service" onPress={() => {}} />
          <SettingRow label="Privacy Policy" onPress={() => {}} />
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.h1, fontWeight: FontWeight.black, color: Colors.text.primary },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bg.card, marginHorizontal: Spacing.md,
    borderRadius: Radius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border.default,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.black, color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  userEmail: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },
  sectionHeader: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.bg.card, marginHorizontal: Spacing.md,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border.default,
    marginBottom: Spacing.sm, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border.subtle,
  },
  rowPressed: { backgroundColor: Colors.bg.elevated },
  rowLabel: { fontSize: FontSize.md, color: Colors.text.primary },
  rowLabelDanger: { color: Colors.danger },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowValue: { fontSize: FontSize.sm, color: Colors.text.muted },
  chevron: { fontSize: 20, color: Colors.text.muted, marginRight: -4 },
  signOutBtn: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.dangerDim, borderRadius: Radius.xl,
    paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.danger + '33',
  },
  signOutPressed: { opacity: 0.7 },
  signOutText: { color: Colors.danger, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
