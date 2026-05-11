import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/shared/auth';
import { Colors } from '@/src/shared/theme';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg.primary },
        animation: 'fade',
      }}
    />
  );
}
