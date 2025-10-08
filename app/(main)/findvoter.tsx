// app/(main)/FindVoter.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FindVoter() {
  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSearch = async () => {
    const trimmedVoterId = voterId.trim();
    const trimmedName = name.trim();
    const trimmedFatherName = fatherName.trim();

    if (!trimmedVoterId && !trimmedName && !mobile) {
      Alert.alert('Missing Fields', 'At least Voter ID or Name is required.');
      return;
    }

    setLoading(true);

    const normalizedGender = gender === 'male' ? 'M' : (gender === 'female' ? 'F' : '');

    const searchParams = {
      voterId: trimmedVoterId.toUpperCase(),
      name: trimmedName.toUpperCase(),
      husband_father_name: trimmedFatherName.toUpperCase(), 
      gender: normalizedGender,
      age,
      mobile: mobile.trim(),
    };

    router.push({ pathname: '/(main)/voterlist', params: searchParams });
    setLoading(false);
  };

  const renderInputField = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    iconName: keyof typeof Feather.glyphMap,
    keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default'
  ) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Feather name={iconName} size={20} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={Colors.textMuted}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Find Voter</Text>
      <Text style={styles.subHeading}>Enter details to search the voter list</Text>

      {renderInputField('Voter ID', 'Enter Voter ID', voterId, setVoterId, 'user')}
      {renderInputField('Name', 'Enter Name', name, setName, 'user')}
      {renderInputField("Husband's / Father's Name", "Enter Husband's / Father's Name", fatherName, setFatherName, 'users')}

      <View>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Feather name="list" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.picker}>
            <Picker.Item label="Select Gender" value="" color={Colors.textMuted} />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>
        </View>
      </View>

      {renderInputField('Age', 'Enter Age', age, setAge, 'calendar', 'numeric')}
      {renderInputField('Mobile No.', 'Enter Mobile No.', mobile, setMobile, 'phone', 'phone-pad')}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSearch} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color={Colors.background} /> : <Text style={styles.buttonText}>Search</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 10, backgroundColor: Colors.accent }]}
        onPress={() => router.push('/(main)/voterlist')}
      >
        <Text style={styles.buttonText}>View Full Voter List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
    marginTop: 10,
    marginLeft: 5,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textDark,
    marginTop: 15,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 55,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
    height: '100%',
    padding: 0,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 10,
    height: 55,
    backgroundColor: Colors.background,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    flex: 1,
    height: 55,
    color: Colors.textDark,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 5,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
});