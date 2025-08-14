// app/(tabs)/map.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import venues from '../../constants/venues';

type Venue = {
  id: string;
  name: string;
  address?: string;
  longDescription?: string;
  lat?: number;
  lng?: number;
};

type VenueWithCoords = Venue & { lat: number; lng: number };

const GEO_CACHE_KEY = 'venueGeo:v1';

async function buildVenueCoordinates(list: Venue[]): Promise<VenueWithCoords[]> {
  const cacheRaw = await AsyncStorage.getItem(GEO_CACHE_KEY);
  const cache: Record<string, { lat: number; lng: number }> = cacheRaw ? JSON.parse(cacheRaw) : {};

  const results: VenueWithCoords[] = [];
  for (const v of list) {
    const id = String(v.id);
    if (typeof v.lat === 'number' && typeof v.lng === 'number') {
      results.push({ ...v, lat: v.lat, lng: v.lng });
      continue;
    }
    if (cache[id]) {
      results.push({ ...v, lat: cache[id].lat, lng: cache[id].lng });
      continue;
    }
    if (!v.address) continue;
    try {
      const hit = await Location.geocodeAsync(v.address);
      if (hit && hit.length > 0 && typeof hit[0].latitude === 'number' && typeof hit[0].longitude === 'number') {
        const lat = hit[0].latitude;
        const lng = hit[0].longitude;
        cache[id] = { lat, lng };
        results.push({ ...v, lat, lng });
      }
    } catch {}
  }
  try { await AsyncStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache)); } catch {}
  return results;
}

export default function MapScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [pins, setPins] = useState<VenueWithCoords[]>([]);

  const list: Venue[] = useMemo(() => (Array.isArray(venues) ? (venues as any) : []), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const coords = await buildVenueCoordinates(list);
        if (!cancelled) {
          setPins(coords);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list]);

  const fitToAllMarkers = () => {
    const coordinates: LatLng[] = pins.map(p => ({ latitude: p.lat, longitude: p.lng }));
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60 + bottom, left: 60 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (pins.length > 0) {
      // Fit once pins are ready
      setTimeout(fitToAllMarkers, 300);
    }
  }, [pins]);

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? top : 0 }]} edges={['left','right','bottom']}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.subtitle}>Explore dog‑friendly spots</Text>
        </View>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#7B8A97" />
          <Text style={styles.mapText}>{isLoading ? 'Loading…' : 'Map is native-only for now'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'android' ? top : 0 }]} edges={['left','right','bottom']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Explore dog‑friendly spots</Text>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={(r) => (mapRef.current = r)}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 52.335,
            longitude: -1.9,
            latitudeDelta: 2.2,
            longitudeDelta: 2.2,
          }}
        >
          {pins.map((v) => (
            <Marker
              key={String(v.id)}
              coordinate={{ latitude: v.lat, longitude: v.lng }}
              title={v.name}
              description={v.address || ''}
              onCalloutPress={() => router.push({ pathname: '/venue/[id]', params: { id: String(v.id) } })}
            />
          ))}
        </MapView>

        {/* Recenter control */}
        <TouchableOpacity style={styles.fab} onPress={fitToAllMarkers}>
          <Ionicons name="locate-outline" color="#0EA5A1" size={22} />
        </TouchableOpacity>
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

  mapWrap: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DCE7ED',
    backgroundColor: '#E9F2F6',
  },
  fab: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EEF2',
  },
});


