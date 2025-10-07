// index.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import '../global.css'; 

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/(main)/findvoter'); 
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-4xl font-extrabold mb-4 text-blue-800 tracking-tight">
        FindVoter
      </Text>
      
      <Text className="text-lg text-gray-600 mb-12 text-center">
        Your reliable resource for civic engagement and voter information.
      </Text>
      
      <TouchableOpacity
        onPress={handleStart}
        className="bg-blue-800 px-12 py-4 rounded-xl shadow-md"
      >
        <Text className="text-white text-xl font-semibold">
          Get Started →
        </Text>
      </TouchableOpacity>
    </View>
  );
}