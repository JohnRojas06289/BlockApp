import { ClerkProvider } from '@clerk/expo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import 'react-native-reanimated';

import { tokenCache } from '@/src/shared/auth/tokenCache';
import { QueryProvider } from '@/src/shared/providers/QueryProvider';
import { Colors } from '@/src/shared/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function NativeMigrationGuard({ children }: { children: React.ReactNode }) {
  const { useMigrations } = require('drizzle-orm/expo-sqlite/migrator');
  const { db } = require('@/src/shared/db/client');
  const migrations = require('@/src/shared/db/migrations/migrations').default;
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.danger }}>Database error: {error.message}</Text>
      </View>
    );
  }
  if (!success) return null;
  return <>{children}</>;
}

function AppShell() {
  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg.primary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryProvider>
  );
}

function ConfigErrorScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
        Missing Clerk configuration
      </Text>
      <Text style={{ color: Colors.text.muted, marginTop: 8, textAlign: 'center' }}>
        Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY before starting or deploying the app.
      </Text>
    </View>
  );
}

function FontGuard({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <ConfigErrorScreen />;
  }

  const inner =
    Platform.OS === 'web' ? (
      <AppShell />
    ) : (
      <NativeMigrationGuard>
        <AppShell />
      </NativeMigrationGuard>
    );

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <FontGuard>{inner}</FontGuard>
    </ClerkProvider>
  );
}
