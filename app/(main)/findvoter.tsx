import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FindVoter() {
  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSearch = () => {
    if (submitting) return;

    const trimmedVoterId = voterId.trim();
    const trimmedName = name.trim();
    const trimmedFatherName = fatherName.trim();

    if (!trimmedVoterId && !trimmedName && !mobile.trim()) {
      Alert.alert('Missing Fields', 'At least Voter ID or Name is required.');
      return;
    }

    setSubmitting(true);

    try {
      const normalizedGender =
        gender === 'male' ? 'M' : gender === 'female' ? 'F' : '';

      const searchParams = {
        voterId: trimmedVoterId.toUpperCase(),
        name: trimmedName.toUpperCase(),
        husband_father_name: trimmedFatherName.toUpperCase(),
        gender: normalizedGender as 'M' | 'F' | '',
        age,
        mobile: mobile.trim(),
      };

      router.push({ pathname: '/(main)/voterlist', params: searchParams });
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    keyboardType = 'default',
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon: keyof typeof Feather.glyphMap;
    keyboardType?: 'default' | 'numeric' | 'phone-pad';
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-2 text-textdark dark:text-dark-text">
        {label}
      </Text>
      <View className="flex-row items-center border border-border dark:border-dark-border bg-background dark:bg-dark-surface rounded-lg px-4 h-[55px] shadow-sm">
        <Feather name={icon} size={20} className="text-textmuted dark:text-dark-textmuted mr-3" />
        <TextInput
          className="flex-1 text-base text-textdark dark:text-dark-text"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 px-5 bg-background dark:bg-dark-background"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[30px] font-extrabold text-center text-primary dark:text-accent mb-1">
          Find Voter
        </Text>
        <Text className="text-base text-center text-textmuted dark:text-dark-textmuted mb-6">
          Enter details to search the voter list
        </Text>

        <InputField
          label="Voter ID"
          placeholder="Enter Voter ID"
          value={voterId}
          onChangeText={setVoterId}
          icon="user"
        />

        <InputField
          label="Name"
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
          icon="user"
        />

        <InputField
          label="Husband's / Father's Name"
          placeholder="Enter Husband's / Father's Name"
          value={fatherName}
          onChangeText={setFatherName}
          icon="users"
        />

        <View className="mb-4">
          <Text className="text-sm font-medium mb-2 text-textdark dark:text-dark-text">Gender</Text>
          <View className="flex-row items-center border border-border dark:border-dark-border bg-background dark:bg-dark-surface rounded-lg px-2 h-[55px] shadow-sm">
            <Feather name="list" size={20} className="text-textmuted dark:text-dark-textmuted mr-2" />
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={{ flex: 1, color: '#1F2937' }} // fallback color
              dropdownIconColor="#6B7280"
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        <InputField
          label="Age"
          placeholder="Enter Age"
          value={age}
          onChangeText={setAge}
          icon="calendar"
          keyboardType="numeric"
        />

        <InputField
          label="Mobile No."
          placeholder="Enter Mobile No."
          value={mobile}
          onChangeText={setMobile}
          icon="phone"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          onPress={handleSearch}
          disabled={submitting}
          className={`mt-6 py-4 rounded-lg items-center justify-center ${
            submitting ? 'bg-disabled' : 'bg-primary dark:bg-accent'
          }`}
        >
          <Text className="text-lg font-bold text-background dark:text-dark-background">
            {submitting ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(main)/voterlist')}
          className="mt-4 py-4 rounded-lg items-center justify-center bg-accent dark:bg-primary active:opacity-90"
        >
          <Text className="text-lg font-bold text-background dark:text-dark-background">
            View Full Voter List
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
