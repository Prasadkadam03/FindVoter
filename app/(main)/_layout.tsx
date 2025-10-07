// app/(main)/_layout.tsx
import { Tabs } from 'expo-router';
import '../../global.css';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function GlobalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
            backgroundColor: Colors.background, 
            borderTopColor: Colors.borderDefault, 
            minHeight: 60, // Use minHeight
            // Let the navigation container handle bottom safe area padding
        },
        tabBarLabelStyle: {
            fontSize: 12, 
            fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="findvoter" 
        options={{ 
            title: 'Find Voter',
            tabBarIcon: ({ color, size }) => (
                <Feather name="search" color={color} size={size} />
            ) 
        }}
      />
      <Tabs.Screen
        name="voterlist" 
        options={{ 
            title: 'Voter List',
            tabBarIcon: ({ color, size }) => (
                <Feather name="list" color={color} size={size} />
            ) 
        }}
      />
    </Tabs>
  );
}