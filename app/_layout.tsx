// app/_layout.tsx
import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useThemeColors from './hooks/useThemeColors';

// Suppress non-critical warnings in development
if (__DEV__) {
  LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
}

export default function RootLayout() {
  const Colors = useThemeColors();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={Colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={Colors.background}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
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
