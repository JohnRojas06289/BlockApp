import type { Blockchain } from '../entities/WalletBalance';

// Ethereum: 0x + 40 hex chars
const ETH_REGEX = /^0x[0-9a-fA-F]{40}$/;

// Bitcoin: P2PKH (1...), P2SH (3...), Bech32 (bc1...)
const BTC_REGEX = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/;

// Solana: base58, 32-44 chars
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const VALIDATORS: Record<Blockchain, RegExp> = {
  ethereum: ETH_REGEX,
  bitcoin: BTC_REGEX,
  solana: SOL_REGEX,
};

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateAddress(address: string, blockchain: Blockchain): ValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return { valid: false, error: 'Address is required' };
  }

  if (!VALIDATORS[blockchain].test(trimmed)) {
    const examples: Record<Blockchain, string> = {
      ethereum: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      bitcoin: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      solana: 'So11111111111111111111111111111111111111112',
    };
    return {
      valid: false,
      error: `Invalid ${blockchain} address. Example: ${examples[blockchain]}`,
    };
  }

  return { valid: true, error: null };
}
