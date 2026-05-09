import { useNetInfo } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const state = useNetInfo();

  // isConnected arranca en null (aún no determinado).
  // Tratamos null como potencialmente online para no bloquear la UI.
  // Solo marcamos offline cuando tenemos confirmación explícita: false.
  const isOnline =
    state.isConnected !== false && state.isInternetReachable !== false;

  return { isOnline };
}
