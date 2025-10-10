// app/_layout.tsx
import React from 'react';
import { StatusBar, useColorScheme as rnUseColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'nativewind';

export default function RootLayout() {
  const scheme = rnUseColorScheme(); // 'light' | 'dark'

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={scheme === 'dark' ? '#0B1220' : '#FFFFFF'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: scheme === 'dark' ? '#0B1220' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen
          name="components/UserDetails"
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
