import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/src/shared/theme';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Si ya está autenticado, redirige a la app principal
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
