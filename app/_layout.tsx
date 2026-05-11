import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/shared/auth';
import { QueryProvider } from '@/src/shared/providers/QueryProvider';
import { Colors } from '@/src/shared/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

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
  const inner =
    Platform.OS === 'web' ? (
      <AppShell />
    ) : (
      <NativeMigrationGuard>
        <AppShell />
      </NativeMigrationGuard>
    );

  return (
    <AuthProvider>
      <FontGuard>{inner}</FontGuard>
    </AuthProvider>
  );
}
