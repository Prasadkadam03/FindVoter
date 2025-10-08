import React, { useState, useEffect, Key } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VoterData {
  id: Key | null | undefined;
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

const fetchVoterListDemo = async (): Promise<VoterData[]> => {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const ENDPOINT = '/voter/search';

  if (!BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const API_URL = `${BASE_URL.replace(/\/+$/, '')}${ENDPOINT}`;

  const payload = {}; 

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), 
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server error: Status ${response.status}. ${errorBody.substring(0, 100)}...`);
  }

  const result: APIResponse = await response.json();

  if (!result.success || result.data.length === 0) {
    throw new Error(result.message || 'No voters found in the list.');
  }

  return result.data;
};


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

const VoterCard: React.FC<{ voter: VoterData }> = ({ voter }) => {
    const displayGender = (voter.gender === 'M' ? 'Male' : (voter.gender === 'F' ? 'Female' : voter.gender));

    return (
        <View style={styles.voterCard}>
            <View style={styles.voterIdCard}>
                <Text style={styles.voterNameLabel}>Voter Name</Text>
                <Text style={styles.voterNameValue}>{voter.name}</Text>
            </View>
            <View style={styles.detailsCard}>
                <DetailRow label="ID" value={voter.voter_code} />
                <DetailRow label="Father/Husband" value={voter.husband_father_name} />
                <DetailRow label="Gender" value={displayGender} />
                <DetailRow label="Age" value={voter.age} />
                <DetailRow label="Mobile" value={voter.mobile} />
            </View>
        </View>
    );
};


export default function UserDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [voterList, setVoterList] = useState<VoterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoters = async () => {
      try {
        const data = await fetchVoterListDemo();
        setVoterList(data);
      } catch (error) {
        console.error('List Load Failed:', error);
        Alert.alert('Load Failed', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadVoters();
  }, []); 

  const handleBack = () => {
    router.back(); 
  };

  return (
    <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
            styles.contentContainer, 
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
        ]}
    >
      
      <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Voter List </Text>
      <Text style={styles.subHeading}>Displaying all fetched voters.</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching all voters...</Text>
        </View>
      ) : voterList.length > 0 ? (
        voterList.map((voter) => (
            <VoterCard key={voter.id} voter={voter} />
        ))
      ) : (
        <Text style={styles.noDataText}>No voters found or API returned an empty list.</Text>
      )}

      {/* Removed the 'View Address' button as requested */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, 
  },
  contentContainer: {
    paddingHorizontal: 20,
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
    marginLeft: 5,
    marginTop: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  voterCard: {
    marginBottom: 30,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  voterIdCard: {
    backgroundColor: Colors.primary, 
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  voterNameLabel: {
    fontSize: 12,
    color: Colors.background, 
    opacity: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  voterNameValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.background, 
    letterSpacing: 1,
  },
  detailsCard: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
      marginTop: 10,
      color: Colors.textMuted,
  },
  noDataText: {
      textAlign: 'center',
      marginTop: 50,
      color: Colors.error,
  }
});