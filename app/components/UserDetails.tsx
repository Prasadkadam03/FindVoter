// app/components/UserDetails.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DetailRowProps {
  label: string;
  value: string | string[] | number | undefined;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{String(value) || 'N/A'}</Text>
  </View>
);

export default function UserDetails() {
  const params = useLocalSearchParams();
  const {
    voterId, name, fatherName, mobile, age, gender,
    houseNumber, sectionName, town, policeStation, taluka, district, pinCode, image
  } = params;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    router.back();
  };
  
  // Reverse map the single letter gender ('M'/'F') from the backend to a readable string
  const displayGender = (gender === 'M' ? 'Male' : (gender === 'F' ? 'Female' : String(gender)));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
      }}
    >

      <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Voter Profile</Text>
      <Text style={styles.subHeading}>Detailed information for the requested voter.</Text>

      <View style={styles.voterIdCard}>
        <Text style={styles.voterIdLabel}>Voter ID</Text>
        <Text style={styles.voterIdValue}>{voterId}</Text>
        {image && <Text style={{ color: Colors.background, fontSize: 12, marginTop: 5 }}>Image: {image}</Text>}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Personal Details</Text>
        <DetailRow label="Full Name" value={name} />
        <DetailRow label="Father/Husband Name" value={fatherName} />
        <DetailRow label="Gender" value={displayGender} />
        <DetailRow label="Age" value={age} />
        <DetailRow label="Mobile No." value={mobile} />
      </View>

      {(houseNumber || district) && (
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Address Details</Text>
          <DetailRow label="House No." value={houseNumber} />
          <DetailRow label="Section" value={sectionName} />
          <DetailRow label="Town/Village" value={town} />
          <DetailRow label="Police Station" value={policeStation} />
          <DetailRow label="Taluka" value={taluka} />
          <DetailRow label="District" value={district} />
          <DetailRow label="PIN Code" value={pinCode} />
        </View>
      )}


      <TouchableOpacity style={styles.actionButton} onPress={handleBack}>
        <Text style={styles.actionButtonText}>Close Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  detailsCard: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { 
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
    textAlign: 'left',
  },
  subHeading: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'left',
  },
  voterIdCard: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  voterIdLabel: {
    fontSize: 14,
    color: Colors.background,
    opacity: 0.7,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  voterIdValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.background,
    letterSpacing: 1.5,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderDefault,
    marginVertical: 5,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '50%',
  },
  actionButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});