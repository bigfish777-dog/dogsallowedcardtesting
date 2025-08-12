// app/venue/[id].tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import venues from '../../constants/venues';
import { useFavourites } from '../../hooks/favourite';

type Venue = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  online?: string;
  image?: string;          // direct .jpg/.png/.webp is ideal
  features?: string[];
  deal?: string;
  description?: string;
  longDescription?: string;
};

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=60';

function looksLikeImage(url?: string) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.endsWith('.webp');
}

export default function VenueDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFav, toggleFav } = useFavourites();

  const v: Venue | undefined = useMemo(
    () => (venues as unknown as Venue[]).find((x) => String(x.id) === String(id)),
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
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Venue not found',
            headerLeft: () => (
              <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color="#0EA5A1" />
                <Text style={styles.backTxt}>Back</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Text style={{ padding: 16 }}>We couldn’t find that venue.</Text>
      </View>
    );
  }

  const liked = isFav(v.id);
  const desc = v.longDescription || v.description || '';
  const heroUrl = looksLikeImage(v.image) ? (v.image as string) : FALLBACK_HERO;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: v.name,
          headerLeft: () => (
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#0EA5A1" />
              <Text style={styles.backTxt}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleFav(String(v.id))}
              style={{ paddingHorizontal: 4, paddingVertical: 4 }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={22}
                color={liked ? '#E63946' : '#7B8A97'}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* HERO with overlayed name */}
      <ImageBackground
        source={{ uri: heroUrl }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroShade} />
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {v.name}
          </Text>
        </View>
      </ImageBackground>

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

        {/* Actions: Call + Directions */}
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

        {/* Add/Remove Fur‑vourites button (outline -> filled) */}
        <TouchableOpacity
          onPress={() => toggleFav(String(v.id))}
          style={[styles.favCta, liked ? styles.favCtaActive : styles.favCtaOutline]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? '#ffffff' : '#E63946'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.favCtaTxt, liked && styles.favCtaTxtActive]}>
            {liked ? 'Remove from Fur‑vourites' : 'Add to Fur‑vourites'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBFC' },

  hero: {
    width: '100%',
    height: 240,
    marginBottom: 12,
  },
  heroImage: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  heroTextWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  content: { paddingHorizontal: 16, paddingTop: 4 },

  dealPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  onlineTxt: { color: '#0EA5A1', fontWeight: '700', maxWidth: 260 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#EEF6F8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  chipTxt: { color: '#1F2D3D', fontWeight: '600' },

  desc: { marginTop: 14, color: '#516170', lineHeight: 20 },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
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

  // Fur‑vourites CTA styles (outline -> filled)
  favCta: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  favCtaOutline: {
    borderWidth: 2,
    borderColor: '#E63946',
    backgroundColor: 'transparent',
  },
  favCtaActive: {
    backgroundColor: '#E63946',
    borderWidth: 2,
    borderColor: '#E63946',
  },
  favCtaTxt: {
    fontWeight: '800',
    color: '#E63946',
  },
  favCtaTxtActive: {
    color: '#fff',
  },

  back: { flexDirection: 'row', alignItems: 'center' },
  backTxt: { marginLeft: 2, color: '#0EA5A1', fontWeight: '700' },
});