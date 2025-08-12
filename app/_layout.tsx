// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { FavouritesProvider } from '../hooks/favourite';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      {/* Only apply bottom safe area background to blend with tab bar */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }} edges={['bottom']}>
        <FavouritesProvider>
          <ThemeProvider value={theme}>
            {/* StatusBar follows theme; override if you prefer light/dark fixed */}
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false, // tab & detail screens manage their own headers
                contentStyle: { backgroundColor: '#F7FBFC' }, // page background
              }}
            />
          </ThemeProvider>
        </FavouritesProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}