import { StyleSheet, Text } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/src/shared/theme';

interface Props {
  value: number | null;
}

export function PriceChange({ value }: Props) {
  if (value === null) return <Text style={styles.neutral}>—</Text>;
  const isPositive = value >= 0;
  return (
    <Text style={[styles.base, isPositive ? styles.positive : styles.negative]}>
      {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  positive: { color: Colors.success },
  negative: { color: Colors.danger },
  neutral: { color: Colors.text.muted, fontSize: FontSize.xs },
});
