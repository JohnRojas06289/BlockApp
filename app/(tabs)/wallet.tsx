import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WalletScreen } from '@/src/modules/wallet/presentation/WalletScreen';

export default function WalletTab() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WalletScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
});
