// app/(tabs)/venues.tsx
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import venues from '../../constants/venues';

// The constants/venues.ts file exports objects with fields like:
// { id, name, description, address, phone, image, features, isFavourite }
// For this screen we derive a lightweight card shape the UI expects.

type CardVenue = { id: string; name: string; city: string; deal: string; blurb?: string };

function cityFromAddress(address?: string): string {
  if (!address) return '';
  // Try to pull the town/city from the address by taking the part after the first comma
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[1];
  // Fallback: last segment if present
  return parts[parts.length - 1] || '';
}

const DATA: CardVenue[] = (venues as any[]).map(v => ({
  id: String(v.id),
  name: v.name || '',
  city: cityFromAddress(v.address),
  deal: Array.isArray(v.features) && v.features.length > 0 ? v.features[0] : 'Dog-friendly venue',
  blurb: v.description || '',
}));

export default function VenuesScreen() {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DATA;
    return DATA.filter(v =>
      (v.name && v.name.toLowerCase().includes(s)) ||
      (v.city && v.city.toLowerCase().includes(s)) ||
      (v.blurb && v.blurb.toLowerCase().includes(s))
    );
  }, [q]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by venue or city…"
        value={q}
        onChangeText={setQ}
        style={styles.search}
        autoCorrect={false}
        placeholderTextColor="#6B7B8C"
      />
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            {!!item.city && <Text style={styles.meta}>{item.city}</Text>}
            {!!item.deal && <Text style={styles.deal}>{item.deal}</Text>}
            {!!item.blurb && <Text style={styles.blurb}>{item.blurb}</Text>}

            {/* Link to details screen */}
            <Link href={`/venue/${item.id}`} asChild>
              <TouchableOpacity style={styles.btn}><Text style={styles.btnTxt}>View details</Text></TouchableOpacity>
            </Link>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7FBFC' },
  search: {
    backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5EDF3', marginBottom: 12, color: '#1F2D3D'
  },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2D3D' },
  meta: { color: '#6B7B8C', marginTop: 2 },
  deal: { marginTop: 8, color: '#1F2D3D', fontWeight: '600' },
  blurb: { marginTop: 6, color: '#516170' },
  btn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#2EC4B6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { color: 'white', fontWeight: '700' }
});
