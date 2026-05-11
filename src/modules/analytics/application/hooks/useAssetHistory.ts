import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { analyticsRepository } from '../../infrastructure/AnalyticsRepository';
import type { ChartRange } from '../usecases/buildAnalyticsDataset';

export function useAssetHistory(assetId: string | null, range: ChartRange) {
  const { isOnline } = useNetworkStatus();

  return useQuery({
    queryKey: ['analytics', 'history', assetId, range, isOnline],
    queryFn: () => analyticsRepository.getAssetHistory({ assetId: assetId!, range, isOnline }),
    enabled: Boolean(assetId),
    staleTime: isOnline ? 5 * 60 * 1000 : Infinity,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
}
