import { StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/src/shared/theme';
import type { HistoricalPoint } from '../application/usecases/buildAnalyticsDataset';

interface Props {
  data: HistoricalPoint[];
  height?: number;
  tone?: 'brand' | 'success' | 'danger';
  highlightLast?: boolean;
}

const TONE_COLOR = {
  brand: Colors.brand.primary,
  success: Colors.success,
  danger: Colors.danger,
} as const;

export function TrendBars({
  data,
  height = 72,
  tone = 'brand',
  highlightLast = true,
}: Props) {
  if (data.length === 0) return null;

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const color = TONE_COLOR[tone];

  return (
    <View style={[styles.chart, { height }]}>
      {data.map((point, index) => {
        const normalized = ((point.value - min) / range) * 0.78 + 0.18;
        const isLast = index === data.length - 1;

        return (
          <View key={`${point.label}-${index}`} style={styles.slot}>
            <View
              style={[
                styles.bar,
                {
                  height: `${normalized * 100}%`,
                  backgroundColor: highlightLast && isLast ? color : `${color}88`,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  slot: {
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    minHeight: 8,
  },
});
