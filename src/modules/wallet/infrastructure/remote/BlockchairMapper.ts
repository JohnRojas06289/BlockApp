import type { BlockchairAddressData, BlockchairTransactionData } from './BlockchairClient';
import type { WalletBalance, Blockchain } from '../../domain/entities/WalletBalance';
import type { Transaction } from '../../domain/entities/Transaction';
import type { NewWalletAddress, NewWalletTransaction } from '@/src/shared/db/schema';

// Blockchair returns satoshis for BTC, wei for ETH — values as strings for precision
function toNativeString(value: number, blockchain: Blockchain): string {
  return value.toString();
}

export function toWalletBalance(
  address: string,
  blockchain: Blockchain,
  dto: BlockchairAddressData,
): WalletBalance {
  const a = dto.address;
  return {
    address,
    blockchain,
    label: null,
    balanceNative: toNativeString(a.balance, blockchain),
    balanceUsd: a.balance_usd ?? null,
    totalReceived: toNativeString(a.received, blockchain),
    totalSent: toNativeString(a.spent, blockchain),
    transactionCount: a.transaction_count ?? null,
    cachedAt: new Date(),
  };
}

export function toTransactions(
  walletAddress: string,
  blockchain: Blockchain,
  dtos: BlockchairTransactionData[],
): Transaction[] {
  return dtos.map((dto) => {
    const tx = dto.transaction;
    const isIncoming = tx.balance_change > 0;

    const fromAddress = dto.inputs[0]?.recipient ?? null;
    const toAddress = dto.outputs[0]?.recipient ?? null;

    return {
      hash: tx.hash,
      walletAddress,
      blockchain,
      blockNumber: tx.block_id,
      timestamp: new Date(tx.time),
      direction: isIncoming ? 'incoming' : 'outgoing',
      fromAddress,
      toAddress,
      valueNative: toNativeString(
        isIncoming ? tx.input_total : tx.output_total,
        blockchain,
      ),
      valueUsd: isIncoming ? tx.input_total_usd : tx.output_total_usd,
      feeNative: toNativeString(tx.fee, blockchain),
      feeUsd: tx.fee_usd,
      status: 'confirmed',
      cachedAt: new Date(),
    };
  });
}

export function toWalletAddressRecord(balance: WalletBalance): NewWalletAddress {
  return {
    address: balance.address,
    blockchain: balance.blockchain,
    label: balance.label,
    balanceNative: balance.balanceNative,
    balanceUsd: balance.balanceUsd,
    totalReceived: balance.totalReceived,
    totalSent: balance.totalSent,
    transactionCount: balance.transactionCount,
    cachedAt: balance.cachedAt,
    createdAt: new Date(),
  };
}

export function toTransactionRecord(tx: Transaction): NewWalletTransaction {
  return {
    hash: tx.hash,
    walletAddress: tx.walletAddress,
    blockchain: tx.blockchain,
    blockNumber: tx.blockNumber,
    timestamp: tx.timestamp,
    direction: tx.direction,
    fromAddress: tx.fromAddress,
    toAddress: tx.toAddress,
    valueNative: tx.valueNative,
    valueUsd: tx.valueUsd,
    feeNative: tx.feeNative,
    feeUsd: tx.feeUsd,
    status: tx.status,
    cachedAt: tx.cachedAt,
  };
}
