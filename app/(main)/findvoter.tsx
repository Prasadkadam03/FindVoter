import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VoterData {
  voter_code: string;
  name: string;
  husband_father_name: string;
  mobile: string;
  house_number: string;
  age: number;
  gender: string;
  image_name: string;
  section_name: string;
  main_town_village: string;
  police_station: string;
  taluka: string;
  district: string;
  pin_code: string;
}

interface APIResponse {
  success: boolean;
  data: VoterData[];
  message: string;
}

const fetchVoterDetails = async (searchParams: any): Promise<VoterData> => {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const ENDPOINT = '/voter/search';

  if (!BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const API_URL = `${BASE_URL.replace(/\/+$/, '')}${ENDPOINT}`;

  const payload: { [key: string]: any } = {};

  Object.keys(searchParams).forEach(key => {
    const value = searchParams[key];
    if (value !== '' && value !== undefined && value !== null) {
      payload[key] = value;
    }
  });

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid search criteria provided.");
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server error: Status ${response.status}. ${errorBody.substring(0, 100)}...`);
  }

  const result: APIResponse = await response.json();

  if (!result.success || result.data.length === 0) {
    throw new Error(result.message || 'Voter details not found or search failed.');
  }

  return result.data[0];
};


export default function FindVoter() {
  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [husband_father_name, setHusband_father_name] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();


  const handleSearch = async () => {
    const trimmedVoterId = voterId.trim();
    const trimmedName = name.trim();
    const trimmedHusbandFatherName = husband_father_name.trim();
    
    if (!trimmedVoterId && !trimmedName && !mobile) {
      Alert.alert('Missing Fields', 'At least Voter ID or Name is required.');
      return;
    }

    setLoading(true);

    const normalizedGender = gender === 'male' ? 'M' : (gender === 'female' ? 'F' : '');

    // Include all form fields for the payload construction (which omits empty ones)
    const searchParams = {
      voterId: trimmedVoterId.toUpperCase(),
      name: trimmedName.toUpperCase(),
      husband_father_name: trimmedHusbandFatherName.toUpperCase(),
      gender: normalizedGender,
      age,
      mobile: mobile.trim(), // Keep mobile here so it can be omitted if empty
    };


    try {
      const voterDetails = await fetchVoterDetails(searchParams);

      router.push({
        pathname: '../components/UserDetails',
        params: {
          voterId: voterDetails.voter_code, 
          name: voterDetails.name,
          husband_father_name: voterDetails.husband_father_name,
          mobile: voterDetails.mobile,
          gender: voterDetails.gender, // 'F' or 'M'
          age: String(voterDetails.age),
          houseNumber: voterDetails.house_number,
          sectionName: voterDetails.section_name,
          town: voterDetails.main_town_village,
          policeStation: voterDetails.police_station,
          taluka: voterDetails.taluka,
          district: voterDetails.district,
          pinCode: voterDetails.pin_code,
          image: voterDetails.image_name,
        },
      });

    } catch (error) {
      console.error('API Search Failed:', error);
      Alert.alert('Search Failed', (error as Error).message || 'An unknown network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (placeholder: string, value: string, onChangeText: (text: string) => void, iconName: keyof typeof Feather.glyphMap, keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default') => (
    <View>
      <Text style={styles.label}>{placeholder.replace('Enter ', '').replace(' ID', '').replace("'s Name", "").replace(' No.', '')}</Text>
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
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 20 }
      ]}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Find Voter</Text>
      <Text style={styles.subHeading}>Enter details to search the voter list</Text>

      {renderInputField("Enter Voter ID", voterId, setVoterId, 'user')}
      {renderInputField("Enter Name", name, setName, 'user')}
      {renderInputField("Enter Husband's / Father's Name", husband_father_name, setHusband_father_name, 'users')}

      <View>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Feather name="list" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" color={Colors.textMuted} />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>
        </View>
      </View>

      {renderInputField("Enter Age", age, setAge, 'calendar', 'numeric')}
      {renderInputField("Enter Mobile No.", mobile, setMobile, 'phone', 'phone-pad')}

      <TouchableOpacity
        style={[styles.button, (loading) && styles.buttonDisabled]}
        onPress={handleSearch}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.background} />
        ) : (
          <Text style={styles.buttonText}>Search</Text>
        )}
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
  },
  subHeading: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
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