// app/(tabs)/venues.tsx
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Venue = { id: string; name: string; city: string; deal: string; blurb?: string };

const DATA: Venue[] = [
  { id: 'bayleys', name: "Bayleys of Bromsgrove", city: "Bromsgrove", deal: "10% off food & hot drinks", blurb: "Neighbourhood bar & bottle shop that loves dogs." },
  { id: 'waylands-bhm', name: "Wayland's Yard", city: "Birmingham", deal: "10% off food & hot drinks", blurb: "Brunch, specialty coffee, big dog energy." },
  { id: 'waylands-wor', name: "Wayland's Yard", city: "Worcester", deal: "10% off food & hot drinks", blurb: "The OG yard. Friendly staff, friendly to paws." },
];

export default function VenuesScreen() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DATA;
    return DATA.filter(v =>
      v.name.toLowerCase().includes(s) ||
      v.city.toLowerCase().includes(s)
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
      />
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.meta}>{item.city}</Text>
            <Text style={styles.deal}>{item.deal}</Text>
            <Text style={styles.blurb}>{item.blurb}</Text>

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
    borderWidth: 1, borderColor: '#E5EDF3', marginBottom: 12
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
