import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/shared/theme';
import type { Blockchain } from '../domain/entities/WalletBalance';
import { validateAddress } from '../domain/validation/addressValidator';

interface Props {
  onSubmit: (address: string, blockchain: Blockchain) => void;
  isLoading: boolean;
}

const BLOCKCHAINS: { label: string; value: Blockchain }[] = [
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Bitcoin', value: 'bitcoin' },
  { label: 'Solana', value: 'solana' },
];

const PLACEHOLDERS: Record<Blockchain, string> = {
  ethereum: '0x742d35Cc6634C0532925a3b844Bc454e...',
  bitcoin: 'bc1qar0srrr7xfkvy5l643lydnw9re59g...',
  solana: 'So11111111111111111111111111111111...',
};

export function AddressInput({ onSubmit, isLoading }: Props) {
  const [address, setAddress] = useState('');
  const [blockchain, setBlockchain] = useState<Blockchain>('ethereum');
  const [error, setError] = useState<string | null>(null);

  function handleChainChange(chain: Blockchain) {
    setBlockchain(chain);
    if (address.trim()) {
      const result = validateAddress(address, chain);
      setError(result.error);
    }
  }

  function handleAddressChange(text: string) {
    setAddress(text);
    if (error) setError(null);
  }

  function handleSubmit() {
    const trimmed = address.trim();
    const result = validateAddress(trimmed, blockchain);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError(null);
    onSubmit(trimmed, blockchain);
  }

  const isDisabled = isLoading || address.trim().length < 10;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Blockchain</Text>
      <View style={styles.chips}>
        {BLOCKCHAINS.map((chain) => (
          <Pressable
            key={chain.value}
            style={[styles.chip, blockchain === chain.value && styles.chipActive]}
            onPress={() => handleChainChange(chain.value)}
          >
            <Text style={[styles.chipText, blockchain === chain.value && styles.chipTextActive]}>
              {chain.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Public Address</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={address}
        onChangeText={handleAddressChange}
        placeholder={PLACEHOLDERS[blockchain]}
        placeholderTextColor={Colors.text.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={isDisabled}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Auditing...' : 'Audit Wallet'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.sm },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.bg.elevated,
  },
  chipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text.muted, fontWeight: FontWeight.medium },
  chipTextActive: { color: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    backgroundColor: Colors.bg.input,
    fontFamily: 'monospace',
  },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, marginTop: -4 },
  button: {
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { backgroundColor: Colors.brand.dim, opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#ffffff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
