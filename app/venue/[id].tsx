// app/venue/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const VENUE_LOOKUP: Record<string, any> = {
  bayleys: { name: "Bayleys of Bromsgrove", city: "Bromsgrove", deal: "10% off food & hot drinks",
    description: "Neighbourhood bottle shop & bar. Dogs welcome inside. Water bowls + treats." },
  "waylands-bhm": { name: "Wayland's Yard (Birmingham)", city: "Birmingham", deal: "10% off food & hot drinks",
    description: "Specialty coffee & brunch. Spacious tables, happy for pups." },
  "waylands-wor": { name: "Wayland's Yard (Worcester)", city: "Worcester", deal: "10% off food & hot drinks",
    description: "Great for weekend brunch with your dog." },
};

export default function VenueDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const v = VENUE_LOOKUP[id ?? ""] ?? { name: "Unknown Venue", city: "", deal: "", description: "" };

  const openMaps = () => Alert.alert("Map", "Hook up to Apple/Google Maps link later.");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: v.name }} />
      <Text style={styles.city}>{v.city}</Text>
      <Text style={styles.deal}>{v.deal}</Text>
      <Text style={styles.desc}>{v.description}</Text>
      <TouchableOpacity style={styles.btn} onPress={openMaps}>
        <Text style={styles.btnTxt}>Get directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBFC', padding: 16 },
  city: { color: '#6B7B8C' },
  deal: { marginTop: 8, fontWeight: '800', color: '#1F2D3D' },
  desc: { marginTop: 10, color: '#516170', lineHeight: 20 },
  btn: { marginTop: 16, backgroundColor: '#2EC4B6', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: 'white', fontWeight: '800' },
});
