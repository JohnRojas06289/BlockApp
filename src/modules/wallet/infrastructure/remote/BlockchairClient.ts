import axios from 'axios';
import { BLOCKCHAIR_BASE_URL, BLOCKCHAIR_API_KEY } from '@/src/shared/constants/api';
import type { Blockchain } from '../../domain/entities/WalletBalance';

// Blockchair chain names differ from our internal names
const CHAIN_MAP: Record<Blockchain, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  solana: 'solana',
};

const client = axios.create({
  baseURL: BLOCKCHAIR_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

// Inyecta el API key en cada request como query param (forma estándar de Blockchair)
client.interceptors.request.use((config) => {
  if (BLOCKCHAIR_API_KEY) {
    config.params = { ...config.params, key: BLOCKCHAIR_API_KEY };
  }
  return config;
});

// ─── Response DTOs ─────────────────────────────────────────────────────────

export interface BlockchairAddressData {
  address: {
    balance: number;
    balance_usd: number;
    received: number;
    spent: number;
    output_count: number;
    transaction_count: number;
  };
  transactions: string[];  // List of tx hashes
  calls?: unknown[];
}

export interface BlockchairTransactionData {
  transaction: {
    block_id: number;
    hash: string;
    time: string;
    input_total: number;
    output_total: number;
    fee: number;
    input_total_usd: number;
    output_total_usd: number;
    fee_usd: number;
    is_coinbase: boolean;
    balance_change: number;
  };
  inputs: Array<{ recipient: string; value: number }>;
  outputs: Array<{ recipient: string; value: number }>;
}

// ─── API Calls ─────────────────────────────────────────────────────────────

export async function fetchAddressData(
  blockchain: Blockchain,
  address: string,
): Promise<BlockchairAddressData> {
  const chain = CHAIN_MAP[blockchain];
  const { data } = await client.get(`/${chain}/dashboards/address/${address}`);

  const addressData = data?.data?.[address];
  if (!addressData) throw new Error(`No data returned for address ${address}`);

  return addressData;
}

export async function fetchTransactions(
  blockchain: Blockchain,
  txHashes: string[],
): Promise<BlockchairTransactionData[]> {
  if (txHashes.length === 0) return [];

  const chain = CHAIN_MAP[blockchain];
  const hashes = txHashes.slice(0, 10).join(',');  // Blockchair limit per call
  const { data } = await client.get(`/${chain}/dashboards/transactions/${hashes}`);

  return Object.values(data?.data ?? {}) as BlockchairTransactionData[];
}
