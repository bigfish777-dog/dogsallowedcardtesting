// app/venue/[id].tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import venues from '../../constants/venues';

type Venue = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  online?: string;
  image?: string;
  features?: string[];
  deal?: string;
  description?: string;
  longDescription?: string;
};

function looksLikeImage(url?: string) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.endsWith('.webp');
}

export default function VenueDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const v: Venue | undefined = useMemo(
    () => (venues as unknown as Venue[]).find(x => String(x.id) === String(id)),
    [id]
  );

  const openMaps = () => {
    if (!v?.address) return Alert.alert('Map', 'No address yet for this venue.');
    const q = encodeURIComponent(v.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  const callVenue = () => {
    if (!v?.phone) return Alert.alert('Call', 'No phone number for this venue.');
    Linking.openURL(`tel:${v.phone}`);
  };

  const openSite = () => {
    if (!v?.online) return;
    const url = v.online.startsWith('http') ? v.online : `https://${v.online}`;
    Linking.openURL(url);
  };

  if (!v) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Venue not found' }} />
        <Text style={{ padding: 16 }}>We couldn’t find that venue.</Text>
      </View>
    );
  }

  const heroOk = looksLikeImage(v.image);
  const desc = v.longDescription || v.description || '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Stack.Screen
        options={{
          headerTitle: v.name,
          headerLeft: () => (
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#0EA5A1" />
              <Text style={styles.backTxt}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {heroOk && (
        <Image source={{ uri: v.image! }} style={styles.hero} resizeMode="cover" />
      )}

      <View style={styles.content}>
        {!!v.deal && (
          <View style={styles.dealPill}>
            <Ionicons name="pricetag" size={14} color="#0EA5A1" />
            <Text style={styles.dealTxt}>{v.deal}</Text>
          </View>
        )}

        {!!v.address && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.metaLabel}>Where</Text>
            <Text style={styles.metaValue}>{v.address}</Text>
          </View>
        )}

        {!!v.online && (
          <Pressable style={styles.online} onPress={openSite}>
            <Ionicons name="globe" size={16} color="#0EA5A1" />
            <Text style={styles.onlineTxt} numberOfLines={1}>
              {v.online.replace(/^https?:\/\//, '')}
            </Text>
          </Pressable>
        )}

        {!!v.features?.length && (
          <View style={styles.chipsWrap}>
            {v.features.map((f, i) => (
              <View key={`${f}-${i}`} style={styles.chip}>
                <Text style={styles.chipTxt}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {!!desc && <Text style={styles.desc}>{desc}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnDark]} onPress={callVenue}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.btnTxt}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openMaps}>
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.btnTxt}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBFC' },
  hero: { width: '100%', height: 220, backgroundColor: '#e7eef3' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  dealPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#E6FFFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  dealTxt: { color: '#0EA5A1', fontWeight: '800' },
  metaLabel: { color: '#6B7B8C', fontSize: 12 },
  metaValue: { color: '#1F2D3D', marginTop: 2 },
  online: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#E6FFFB',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  onlineTxt: { color: '#0EA5A1', fontWeight: '700', maxWidth: 240 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#EEF6F8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  chipTxt: { color: '#1F2D3D', fontWeight: '600' },
  desc: { marginTop: 14, color: '#516170', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: '#2EC4B6' },
  btnDark: { backgroundColor: '#0F172A' },
  btnTxt: { color: '#fff', fontWeight: '800' },
  back: { flexDirection: 'row', alignItems: 'center' },
  backTxt: { marginLeft: 2, color: '#0EA5A1', fontWeight: '700' },
});