import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalyticsScreen } from '@/src/modules/analytics/presentation/AnalyticsScreen';
import { Colors } from '@/src/shared/theme';

export default function AnalyticsTab() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnalyticsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
});
