import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { marketRepository } from '../../infrastructure/MarketRepository';

export function useMarketData(limit = 10) {
  const { isOnline } = useNetworkStatus();

  return useQuery({
    // isOnline en el key: cuando cambia de false→true React Query
    // re-ejecuta la query en lugar de servir el resultado cacheado vacío.
    queryKey: ['market', 'top', limit, isOnline],
    queryFn: () => marketRepository.getTopAssets({ isOnline, limit }),
    staleTime: isOnline ? 5 * 60 * 1000 : Infinity,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
}
