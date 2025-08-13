// app/(tabs)/venues.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import venues from '../../constants/venues';
import { useFavourites } from '../../hooks/favourite';

type Venue = {
  id: string;
  name: string;
  address?: string;
  description?: string;
  longDescription?: string;
  deal?: string;
  features?: string[];
  postcode?: string;
};

function stripBracketedLocation(name: string) {
  // Remove trailing " (Something)" from names like "Café Morso (Bromsgrove)"
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function extractCity(address?: string) {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  const seg = parts.length >= 2 ? parts[1] : parts[parts.length - 1] || '';
  const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i;
  return seg.replace(POSTCODE, '').trim();
}

function shortLineFor(v: Venue) {
  if (typeof v.deal === 'string' && v.deal.trim()) return v.deal.trim();
  const text =
    (typeof v.description === 'string' && v.description.trim()) ||
    (typeof v.longDescription === 'string' && v.longDescription.trim()) ||
    '';
  if (!text) return 'Dog-friendly venue';
  const words = text.split(/\s+/);
  const first = words.slice(0, 10).join(' ');
  return first + (words.length > 10 ? '…' : '');
}

export default function VenuesScreen() {
  const [q, setQ] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);

  const { bottom } = useSafeAreaInsets();

  const { favs, toggleFav, isFav } = useFavourites();

  const shaped = useMemo(() => {
    const list: Venue[] = Array.isArray(venues) ? (venues as any) : [];
    return list.map(v => {
      const city = extractCity(v.address);
      const title = stripBracketedLocation(v.name);
      const short = shortLineFor(v);
      return { ...v, city, title, short } as any;
    });
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    let items = shaped;
    if (s) {
      items = items.filter(v =>
        (v.title && (v.title as string).toLowerCase().includes(s)) ||
        (v.city && (v.city as string).toLowerCase().includes(s)) ||
        (v.short && (v.short as string).toLowerCase().includes(s)) ||
        (v.address && (v.address as string).toLowerCase().includes(s))
      );
    }
    if (onlyFavs) {
      items = items.filter(v => isFav(String(v.id)));
    }
    return items;
  }, [q, onlyFavs, shaped, isFav]);

  const onToggleFav = useCallback((id: string) => {
    toggleFav(String(id));
  }, [toggleFav]);

  // Sticky header (search + Fur‑vourites toggle)
  const renderHeader = () => (
    <View style={styles.headerWrap}>
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

      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setOnlyFavs(false)}
          style={[styles.toggleBtn, !onlyFavs && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleTxt, !onlyFavs && styles.toggleTxtActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOnlyFavs(true)}
          style={[styles.toggleBtn, onlyFavs && styles.toggleBtnActive]}
        >
          <Ionicons
            name={onlyFavs ? 'heart' : 'heart-outline'}
            size={14}
            color={onlyFavs ? '#ffffff' : '#6B7B8C'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.toggleTxt, onlyFavs && styles.toggleTxtActive]}>Fur‑vourites</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(i: any) => String(i.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 16 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        renderItem={({ item }: { item: any }) => {
          const liked = isFav(item.id);
          return (
            <View style={styles.card}>
              {/* Heart on card */}
              <TouchableOpacity
                onPress={() => onToggleFav(item.id)}
                style={styles.heartBtn}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked ? '#E63946' : '#7B8A97'}
                />
              </TouchableOpacity>

              <Text style={styles.title}>{item.title}</Text>
              {!!item.city && <Text style={styles.meta}>{item.city}</Text>}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FBFC',
  },

  headerWrap: {
    backgroundColor: '#F7FBFC',
    paddingTop: 8,
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
    marginHorizontal: 1,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 36, color: '#1F2D3D' },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E9F2F6',
    borderWidth: 1,
    borderColor: '#DCE7ED',
  },
  toggleBtnActive: {
    backgroundColor: '#2EC4B6',
    borderColor: '#2EC4B6',
  },
  toggleTxt: {
    color: '#6B7B8C',
    fontWeight: '700',
  },
  toggleTxtActive: {
    color: '#ffffff',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
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

});