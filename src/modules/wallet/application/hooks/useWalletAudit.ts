import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/src/shared/network/useNetworkStatus';
import { walletRepository } from '../../infrastructure/WalletRepository';
import type { Blockchain } from '../../domain/entities/WalletBalance';

export function useWalletAudit(address: string, blockchain: Blockchain) {
  const { isOnline } = useNetworkStatus();

  return useQuery({
    queryKey: ['wallet', blockchain, address, isOnline],
    queryFn: () => walletRepository.auditWallet({ address, blockchain, isOnline }),
    enabled: address.length > 10,
    staleTime: isOnline ? 10 * 60 * 1000 : Infinity,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
}

export function useSavedWallets() {
  return useQuery({
    queryKey: ['wallet', 'saved'],
    queryFn: () => walletRepository.getSavedAddresses(),
    staleTime: 60 * 1000,
  });
}
