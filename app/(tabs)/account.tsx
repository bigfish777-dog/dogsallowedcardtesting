// app/(tabs)/account.tsx
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
  const manage = () => Alert.alert('Manage Subscription', 'Stripe customer portal coming soon.');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.meta}>Nick Fisher • thula@dogsallowed</Text>

      <TouchableOpacity style={styles.btn} onPress={manage}>
        <Text style={styles.btnTxt}>Manage Subscription</Text>
      </TouchableOpacity>
      <Text style={styles.small}>Change card, cancel, or update billing when connected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7FBFC' },
  title: { fontSize: 22, fontWeight: '900', color: '#1F2D3D' },
  meta: { marginTop: 6, color: '#6B7B8C' },
  btn: { marginTop: 16, backgroundColor: '#2EC4B6', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: 'white', fontWeight: '800' },
  small: { marginTop: 8, color: '#6B7B8C', fontSize: 12 }
});
