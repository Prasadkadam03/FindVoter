// app/_layout.tsx
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 

// Suppress the persistent non-critical warning coming from external dependencies
if (__DEV__) {
  LogBox.ignoreLogs([
    'SafeAreaView has been deprecated',
  ]);
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
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