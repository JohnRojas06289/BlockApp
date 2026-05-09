import { isAxiosError } from 'axios';
import type { IWalletRepository, AuditResult } from '../domain/ports/WalletRepository.port';
import type { Blockchain, WalletBalance } from '../domain/entities/WalletBalance';
import { fetchAddressData, fetchTransactions } from './remote/BlockchairClient';
import {
  toWalletBalance,
  toTransactions,
  toWalletAddressRecord,
  toTransactionRecord,
} from './remote/BlockchairMapper';
import * as local from './local/WalletLocalDataSource';
import { WALLET_CACHE_TTL_MS } from '@/src/shared/constants/api';

class WalletRepository implements IWalletRepository {
  async auditWallet({
    address,
    blockchain,
    isOnline,
  }: {
    address: string;
    blockchain: Blockchain;
    isOnline: boolean;
  }): Promise<AuditResult> {
    // Offline: devuelve lo que tengamos en cache
    if (!isOnline) {
      return this.fromCache(address, blockchain);
    }

    // Online: respeta el TTL para no saturar la API
    const isStale = await local.isCacheStale(address, WALLET_CACHE_TTL_MS);
    if (!isStale) {
      return this.fromCache(address, blockchain);
    }

    try {
      const addressData = await fetchAddressData(blockchain, address);
      const balance = toWalletBalance(address, blockchain, addressData);

      const txHashes = addressData.transactions ?? [];
      const txDtos = await fetchTransactions(blockchain, txHashes);
      const transactions = toTransactions(address, blockchain, txDtos);

      await local.upsertWalletAddress(toWalletAddressRecord(balance));
      await local.upsertTransactions(transactions.map(toTransactionRecord));
      await local.markSynced(address);

      return { balance, transactions };
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 402) {
        throw new Error('Blockchair API key required or quota exceeded.');
      }
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Address not found on ${blockchain}.`);
      }
      return this.fromCache(address, blockchain);
    }
  }

  async getSavedAddresses(): Promise<WalletBalance[]> {
    return local.getAllWallets();
  }

  private async fromCache(address: string, blockchain: Blockchain): Promise<AuditResult> {
    const balance = await local.getWalletBalance(address);
    const transactions = await local.getTransactions(address);

    const emptyBalance: WalletBalance = {
      address,
      blockchain,
      label: null,
      balanceNative: null,
      balanceUsd: null,
      totalReceived: null,
      totalSent: null,
      transactionCount: null,
      cachedAt: new Date(0),
    };

    return { balance: balance ?? emptyBalance, transactions };
  }
}

export const walletRepository = new WalletRepository();
