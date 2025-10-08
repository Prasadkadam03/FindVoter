// app/(main)/FindVoter.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from '../hooks/useThemeColors';

export default function FindVoter() {
  const Colors = useThemeColors();

  const [voterId, setVoterId] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSearch = async () => {
    if (submitting) return; // debounce / lock
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
        husband_father_name: trimmedFatherName.toUpperCase(), // ✅ unified param
        gender: normalizedGender as 'M' | 'F' | '',
        age,
        mobile: mobile.trim(),
      };

      router.push({ pathname: '/(main)/voterlist', params: searchParams });
    } finally {
      setSubmitting(false);
    }
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
      <Text style={[styles.label, { color: Colors.textDark }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: Colors.borderDefault, backgroundColor: Colors.background, shadowColor: '#000' },
        ]}
      >
        <Feather
          name={iconName}
          size={20}
          color={Colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: Colors.textDark }]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.kav, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20, backgroundColor: Colors.background },
        ]}
        style={[styles.container, { backgroundColor: Colors.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: Colors.primary }]}>Find Voter</Text>
        <Text style={[styles.subHeading, { color: Colors.textMuted }]}>
          Enter details to search the voter list
        </Text>

        {renderInputField('Voter ID', 'Enter Voter ID', voterId, setVoterId, 'user')}
        {renderInputField('Name', 'Enter Name', name, setName, 'user')}
        {renderInputField(
          "Husband's / Father's Name",
          "Enter Husband's / Father's Name",
          fatherName,
          setFatherName,
          'users'
        )}

        <View>
          <Text style={[styles.label, { color: Colors.textDark }]}>Gender</Text>
          <View
            style={[
              styles.pickerContainer,
              { borderColor: Colors.borderDefault, backgroundColor: Colors.background, shadowColor: '#000' },
            ]}
          >
            <Feather
              name="list"
              size={20}
              color={Colors.textMuted}
              style={styles.inputIcon}
            />
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={[styles.picker, { color: Colors.textDark }]}
              dropdownIconColor={Colors.textMuted}
            >
              <Picker.Item label="Select Gender" value="" color={Colors.textMuted} />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        {renderInputField('Age', 'Enter Age', age, setAge, 'calendar', 'numeric')}
        {renderInputField('Mobile No.', 'Enter Mobile No.', mobile, setMobile, 'phone', 'phone-pad')}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: submitting ? Colors.buttonDisabled : Colors.primary,
            },
          ]}
          onPress={handleSearch}
          disabled={submitting}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <Text style={[styles.buttonText, { color: Colors.background }]}>Search</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: Colors.accent }]}
          onPress={() => router.push('/(main)/voterlist')}
          activeOpacity={0.9}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.buttonText, { color: Colors.background }]}>
            View Full Voter List
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 10,
    marginLeft: 5,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 55,
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
    height: '100%',
    padding: 0,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: 55,
    paddingHorizontal: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    flex: 1,
    height: 55,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
