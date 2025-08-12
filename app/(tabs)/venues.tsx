// app/(tabs)/venues.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import venues from '../../constants/venues';

type Venue = {
  id: string;
  name: string;
  address?: string;
  description?: string;
  longDescription?: string;
  deal?: string;          // e.g. "10% Off Food & Hot Drinks"
  features?: string[];
  postcode?: string;      // optional if you add it later
};

function stripBracketedLocation(name: string) {
  // Remove trailing " (Something)" from names like "Café Morso (Bromsgrove)"
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function extractCity(address?: string) {
  if (!address) return '';
  // Try the segment after the first comma
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  const seg = parts.length >= 2 ? parts[1] : parts[parts.length - 1] || '';
  // Remove UK postcode if present (rough match, safe fallback)
  const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i;
  return seg.replace(POSTCODE, '').trim();
}

function shortLineFor(v: Venue) {
  // Prefer the deal (usually ~4–8 words). Otherwise take first 8–10 words of description.
  if (typeof v.deal === 'string' && v.deal.trim()) return v.deal.trim();

  const text = (typeof v.description === 'string' && v.description.trim())
    ? v.description.trim()
    : (typeof v.longDescription === 'string' && v.longDescription.trim())
      ? v.longDescription.trim()
      : '';

  if (!text) return 'Dog-friendly venue';
  const words = text.split(/\s+/).slice(0, 10).join(' ');
  return words + (text.split(/\s+/).length > 10 ? '…' : '');
}

export default function VenuesScreen() {
  const [q, setQ] = useState('');
  const [favs, setFavs] = useState<string[]>([]); // in-memory for now (no AsyncStorage yet)

  const toggleFav = useCallback((id: string) => {
    setFavs(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list: Venue[] = Array.isArray(venues) ? (venues as any) : [];
    const shaped = list.map(v => {
      const city = extractCity(v.address);
      const title = stripBracketedLocation(v.name);
      const short = shortLineFor(v);
      return { ...v, city, title, short } as any;
    });

    if (!s) return shaped;
    return shaped.filter(v =>
      (v.title && (v.title as string).toLowerCase().includes(s)) ||
      (v.city && (v.city as string).toLowerCase().includes(s)) ||
      (v.short && (v.short as string).toLowerCase().includes(s)) ||
      (v.address && (v.address as string).toLowerCase().includes(s))
    );
  }, [q]);

  return (
    <View style={styles.screen}>
      {/* Search with magnifying glass (inside) */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#6B7B8C" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by venue or city…"
          placeholderTextColor="#6B7B8C"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(i: any) => String(i.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }: { item: any }) => {
          const liked = favs.includes(item.id);
          return (
            <View style={styles.card}>
              {/* Heart (G) */}
              <TouchableOpacity
                onPress={() => toggleFav(item.id)}
                style={styles.heartBtn}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked ? '#E63946' : '#7B8A97'}
                />
              </TouchableOpacity>

              {/* Title (D) – no bracketed location */}
              <Text style={styles.title}>{item.title}</Text>

              {/* City only (E – no postcode) */}
              {!!item.city && <Text style={styles.meta}>{item.city}</Text>}

              {/* Short line / deal (C) */}
              {!!item.short && <Text style={styles.deal}>{item.short}</Text>}

              <Link href={{ pathname: '/venue/[id]', params: { id: String(item.id) } }} asChild>
                <TouchableOpacity style={styles.btn}>
                  <Text style={styles.btnTxt}>View details</Text>
                </TouchableOpacity>
              </Link>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />

      {/* Bottom safe pad (A/F): matches the tab bar background so no grey overlay */}
      <View style={styles.bottomSafePad} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FBFC',
  },
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EDF3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 36, color: '#1F2D3D' },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // ensures cards never tuck under the tab bar / home indicator
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EEF2',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heartBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2D3D', paddingRight: 32 },
  meta: { color: '#6B7B8C', marginTop: 2 },
  deal: { marginTop: 8, color: '#1F2D3D', fontWeight: '600' },

  // CTA
  btn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#2EC4B6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnTxt: { color: 'white', fontWeight: '700' },

  // Bottom pad to match tab bar color (#121212)
  bottomSafePad: {
    height: Platform.OS === 'ios' ? 16 : 0,
    backgroundColor: '#121212',
  },
});