// app/(tabs)/membership.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY = 'petPhotoUri:v1';
const MEMBERSHIP_ACTIVE = true; // wire this up later if you want dynamic status

export default function MembershipScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // More reliable permission flow with hooks
  const [libPerm, requestLibPerm] = ImagePicker.useMediaLibraryPermissions();
  const [camPerm, requestCamPerm] = ImagePicker.useCameraPermissions();

  // Load persisted photo
  useEffect(() => {
    (async () => {
      try {
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) setPhotoUri(uri);
      } catch {}
    })();
  }, []);

  const saveUri = async (uri: string | null) => {
    try {
      if (uri) {
        await AsyncStorage.setItem(STORAGE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setPhotoUri(uri);
    } catch {
      Alert.alert('Error', 'Could not save photo.');
    }
  };

  const ensureLibraryPerm = async () => {
    // If already granted, good to go
    if (libPerm?.granted) return true;
    const res = await requestLibPerm();
    if (!res.granted) {
      Alert.alert(
        'Allow Photos Access',
        'To choose a picture, allow Photos access in Settings.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings?.() },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return false;
    }
    return true;
  };

  const ensureCameraPerm = async () => {
    if (Platform.OS === 'web') return false;
    if (camPerm?.granted) return true;
    const res = await requestCamPerm();
    if (!res.granted) {
      Alert.alert(
        'Allow Camera Access',
        'To take a photo, allow Camera access in Settings.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings?.() },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    const ok = await ensureLibraryPerm();
    if (!ok) return;
    // Backwards-compatible API for current package version
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      await saveUri(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const ok = await ensureCameraPerm();
    if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      await saveUri(res.assets[0].uri);
    }
  };

  const changePhoto = () => {
    const options: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [
      { text: 'Choose from library', onPress: pickFromLibrary },
      { text: 'Take a photo', onPress: takePhoto },
    ];
    if (photoUri) options.push({ text: 'Remove photo', style: 'destructive', onPress: () => saveUri(null) });
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Pet photo', 'Update your membership photo', options, { cancelable: true });
  };

  return (
    // No top edge to keep spacing tight under the header
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HERO IMAGE */}
        <TouchableOpacity onPress={changePhoto} activeOpacity={0.9} style={styles.heroWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]}>
              <Ionicons name="camera" size={28} color="#ffffff" />
              <Text style={styles.heroPlaceholderText}>Add pet photo</Text>
            </View>
          )}

        {/* overlay row: ACTIVE + change hint */}
          <View style={styles.heroOverlay}>
            {MEMBERSHIP_ACTIVE && (
              <View style={styles.activePill}>
                <Text style={styles.activeTxt}>ACTIVE</Text>
              </View>
            )}
            <View style={styles.changeHint}>
              <Ionicons name="camera-outline" size={16} color="#ffffff" />
              <Text style={styles.changeHintTxt}>Change photo</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* MEMBERSHIP CARD */}
        <View style={styles.card}>
          <Text style={styles.brand}>dogs allowed</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Member</Text>
            <Text style={styles.value}>Nick & Thula</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>10 Aug 2026</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.value}>DAC-000123</Text>
          </View>
        </View>

        {/* WALLET BUTTONS — styled to match Venues UI (teal primary + outline pill) */}
        <View style={styles.walletRow}>
          <TouchableOpacity
            style={[styles.walletBtn, styles.walletPrimary]}
            onPress={() => Alert.alert('Apple Wallet', 'Will open a real PassKit link later.')}
          >
            <Ionicons name="logo-apple" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={[styles.walletTxt, styles.walletTxtPrimary]} numberOfLines={1}>Add to Apple Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.walletBtn, styles.walletOutline]}
            onPress={() => Alert.alert('Google Wallet', 'Will open a real Wallet link later.')}
          >
            <Ionicons name="wallet-outline" size={18} color="#0EA5A1" style={{ marginRight: 8 }} />
            <Text style={[styles.walletTxt, styles.walletTxtOutline]} numberOfLines={1}>Add to Google Wallet</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.caption}>These will open real PassKit links later.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBFC' },
  content: { paddingBottom: 28 },

  /* HERO */
  heroWrap: {
    marginTop: 8,          // tight under the header
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 260,
    backgroundColor: '#c8d4dc',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    color: '#ffffff',
    marginTop: 6,
    fontWeight: '700',
  },
  heroOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#0F9D58',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeTxt: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  changeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  changeHintTxt: {
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 12,
  },

  /* CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5EDF3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  brand: {
    color: '#2EC4B6',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4F7',
  },
  label: { color: '#6B7B8C', fontWeight: '700' },
  value: { color: '#1F2D3D', fontWeight: '800' },

  /* WALLET — align with Venues UI */
  walletRow: {
    flexDirection: 'column',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  walletBtn: {
    width: '100%',
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  walletPrimary: {
    backgroundColor: '#2EC4B6',
    borderColor: '#2EC4B6',
  },
  walletOutline: {
    backgroundColor: '#E9F2F6',
    borderColor: '#DCE7ED',
  },
  walletTxt: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    maxWidth: '85%',
    paddingHorizontal: 6,
    paddingTop: 2,
    flexShrink: 1,
  },
  walletTxtPrimary: { color: '#ffffff' },
  walletTxtOutline: { color: '#0EA5A1' },

  caption: {
    color: '#6B7B8C',
    paddingHorizontal: 16,
    marginTop: 8,
  },
});