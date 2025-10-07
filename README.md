# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


/app
  /main
    FindVoter.tsx
    UserDetails.tsx
    _layout.tsx
  index.tsx



----------------
im using tsx 
and inside app folder
i have main folder and index.tsx
in main i have _layout.tsx
findvoter 
voterlist

------------------------------------------------------------------

index.tsx
"import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/main'); // Navigate to tabs layout
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* <Image
        source={require('../assets/images/logo.png')}
        className="w-40 h-40 mb-10"
        resizeMode="contain"
      /> */}
      <Text className="text-2xl font-bold mb-6 text-blue-500">
        Welcome to FindVoter
      </Text>
      <TouchableOpacity
        onPress={handleStart}
        className="bg-blue-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white text-lg">Enter →</Text>
      </TouchableOpacity>
    </View>
  );
}
"

import { Tabs } from 'expo-router';
import '../../global.css';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB', // blue-600
      }}
    >
      <Tabs.Screen
        name="findvoter"
        options={{ title: 'Find Voter' }}
      />
      <Tabs.Screen
        name="voterlist"
        options={{ title: 'Voter List' }}
      />
    </Tabs>
  );
}

import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

export default function FindVoter() {
  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);

    // Simulate search delay (replace with actual API call)
    setTimeout(() => {
      console.log('Searching voter:', { voterId, name, fatherName, gender, age, mobile });
      setLoading(false);
    }, 2000);
  };

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-xl font-bold mb-4">Find Voter</Text>

      <TextInput
        className="border border-gray-300 rounded p-2 mb-4"
        placeholder="Enter Voter ID"
        value={voterId}
        onChangeText={setVoterId}
      />
      
      <TextInput
        className="border border-gray-300 rounded p-2 mb-4"
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="border border-gray-300 rounded p-2 mb-4"
        placeholder="Enter Father's Name"
        value={fatherName}
        onChangeText={setFatherName}
      />

      <Text className="mb-2">Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        className="border border-gray-300 rounded mb-4"
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
        <Picker.Item label="Other" value="other" />
      </Picker>

      <TextInput
        className="border border-gray-300 rounded p-2 mb-4"
        placeholder="Enter Age"
        value={age}
        keyboardType="numeric"
        onChangeText={setAge}
      />

      <TextInput
        className="border border-gray-300 rounded p-2 mb-4"
        placeholder="Enter Mobile No."
        value={mobile}
        keyboardType="phone-pad"
        onChangeText={setMobile}
      />

      <Button title={loading ? 'Searching...' : 'Search'} onPress={handleSearch} disabled={loading} />

      {loading && <ActivityIndicator size="large" color="#0000ff" className="mt-4" />}
    </View>
  );
}


import { View, Text } from 'react-native';

export default function VoterList() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">Voter List Screen</Text>
    </View>
  );
}

