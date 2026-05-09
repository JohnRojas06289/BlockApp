import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Clerk requiere un token cache para persistir la sesión entre reinicios.
// En native: expo-secure-store (Keychain en iOS, Keystore en Android).
// En web: Clerk maneja la sesión con cookies httpOnly — no se necesita cache.
export const tokenCache =
  Platform.OS !== 'web'
    ? {
        async getToken(key: string) {
          return SecureStore.getItemAsync(key);
        },
        async saveToken(key: string, value: string) {
          return SecureStore.setItemAsync(key, value);
        },
        async clearToken(key: string) {
          return SecureStore.deleteItemAsync(key);
        },
      }
    : undefined;
