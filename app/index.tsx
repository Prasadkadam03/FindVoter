// app/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import 'nativewind';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/(main)/voterlist');
  };

  return (
    <View className="flex-1 p-6 items-center justify-center bg-background dark:bg-dark-background">
      <View className="w-full rounded-2xl py-9 px-6 items-center shadow-lg bg-background dark:bg-dark-surface">
        <Text className="text-[34px] font-extrabold mb-2 tracking-wider text-primary dark:text-accent">
          FindVoter
        </Text>

        <Text className="text-base text-center mb-7 text-textmuted dark:text-dark-textmuted">
          Your reliable resource for civic engagement and voter information.
        </Text>

        <TouchableOpacity
          onPress={handleStart}
          className="py-3.5 px-7 rounded-xl items-center justify-center bg-primary dark:bg-accent active:opacity-90"
        >
          <Text className="text-lg font-bold text-background dark:text-dark-background">
            Get Started →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
