// app/(tabs)/membership.tsx
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MembershipScreen() {
  const addApple = () => Alert.alert('Add to Apple Wallet', 'Hook up PassKit link here.');
  const addGoogle = () => Alert.alert('Save to Google Wallet', 'Hook up PassKit link here.');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>dogs allowed</Text>
        <Text style={styles.member}>Member: Nick & Thula</Text>
        <Text style={styles.expiry}>Expires: 10 Aug 2026</Text>
        <Text style={styles.id}>ID: DAC-000123</Text>
      </View>

      <TouchableOpacity style={styles.apple} onPress={addApple}>
        <Text style={styles.btnTxt}>Add to Apple Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.google} onPress={addGoogle}>
        <Text style={[styles.btnTxt, { color: '#1F2D3D' }]}>Save to Google Wallet</Text>
      </TouchableOpacity>

      <Text style={styles.note}>These will open real PassKit links later.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#F7FBFC' },
  card: { backgroundColor: '#2EC4B6', borderRadius: 16, padding: 20 },
  brand: { fontSize: 20, fontWeight: '900', color: 'white' },
  member: { marginTop: 8, color: 'white', fontWeight: '700' },
  expiry: { marginTop: 4, color: 'white' },
  id: { marginTop: 4, color: 'white', opacity: 0.9 },
  apple: { backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  google: { backgroundColor: 'white', paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDE6EE' },
  btnTxt: { color: 'white', fontWeight: '800' },
  note: { marginTop: 6, color: '#6B7B8C', fontSize: 12 }
});
