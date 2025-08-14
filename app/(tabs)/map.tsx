// app/(tabs)/map.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import venues from '../../constants/venues';

type Venue = {
  id: string;
  name: string;
  address?: string;
  longDescription?: string;
};

export default function MapScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(() => {
    const list: Venue[] = Array.isArray(venues) ? (venues as any) : [];
    return list.map(v => ({ id: String(v.id), title: v.name })) as { id: string; title: string }[];
  }, []);

  // Placeholder while we wire up a real map provider
  const onOpenMap = (id: string) => {
    const venue = (venues as any[]).find(v => String(v.id) === id);
    Alert.alert('Map coming soon', venue?.name || 'Venue');
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? top : 0 }]} edges={['left','right','bottom']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Explore dog‑friendly spots</Text>
      </View>

      {/* Placeholder map area */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color="#7B8A97" />
        <Text style={styles.mapText}>Interactive map coming soon</Text>
      </View>

      {/* Quick list to simulate markers for now */}
      <View style={[styles.listWrap, { paddingBottom: bottom + 8 }]}>
        {items.map(v => (
          <TouchableOpacity key={v.id} style={styles.row} onPress={() => onOpenMap(v.id)}>
            <Ionicons name="location-outline" size={18} color="#0EA5A1" style={{ marginRight: 8 }} />
            <Text style={styles.rowTxt} numberOfLines={1}>{v.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBFC' },
  headerRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  title: { fontSize: 24, fontWeight: '900', color: '#1F2D3D' },
  subtitle: { color: '#6B7B8C', marginTop: 2 },

  mapPlaceholder: {
    marginTop: 8,
    marginHorizontal: 16,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#E9F2F6',
    borderWidth: 1,
    borderColor: '#DCE7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: { marginTop: 8, color: '#6B7B8C', fontWeight: '700' },

  listWrap: { marginTop: 12, paddingHorizontal: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EEF2',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowTxt: { color: '#1F2D3D', fontWeight: '700', flexShrink: 1 },
});


