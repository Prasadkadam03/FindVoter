// app/(main)/voterlist.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchVoterList, Voter } from '../../lib/api';

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{(value ?? 'N/A').toString()}</Text>
  </View>
);

const VoterCard = ({ voter, onPress }: { voter: Voter; onPress: () => void }) => {
  const displayGender = voter.gender === 'M' ? 'Male' : voter.gender === 'F' ? 'Female' : voter.gender;
  return (
    <TouchableOpacity style={styles.voterCard} onPress={onPress} activeOpacity={0.8}>
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
    </TouchableOpacity>
  );
};

export default function VoterListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  const search = {
    voterId: typeof params.voterId === 'string' ? params.voterId : undefined,
    name: typeof params.name === 'string' ? params.name : undefined,
    husband_father_name: typeof params.husband_father_name === 'string' ? params.husband_father_name : undefined,
    gender: typeof params.gender === 'string' ? (params.gender as 'M' | 'F' | '') : undefined,
    age: typeof params.age === 'string' ? params.age : undefined,
    mobile: typeof params.mobile === 'string' ? params.mobile : undefined,
  };

  const hasSearch =
    !!search.voterId || !!search.name || !!search.husband_father_name || !!search.gender || !!search.age || !!search.mobile;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchVoterList(hasSearch ? search : undefined);
        setVoters(list);
      } catch (err: any) {
        console.error('Voter list fetch failed:', err);
        Alert.alert('Load Failed', err?.message || 'Unable to load voters.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.voterId, params?.name, params?.husband_father_name, params?.gender, params?.age, params?.mobile]);

  const openDetails = (v: Voter) => {
    router.push({
      pathname: '/components/UserDetails',
      params: {
        voterId: v.voter_code,
        name: v.name,
        fatherName: v.husband_father_name, // NOTE: details screen expects fatherName
        mobile: v.mobile,
        gender: v.gender, // 'M' | 'F'
        age: String(v.age),
        houseNumber: v.house_number,
        sectionName: v.section_name,
        town: v.main_town_village,
        policeStation: v.police_station,
        taluka: v.taluka,
        district: v.district,
        pinCode: v.pin_code,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
    >
      <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Voter List</Text>
      <Text style={styles.subHeading}>
        {loading
          ? 'Loading...'
          : hasSearch
            ? `Showing ${voters.length} result(s) for your search`
            : `Showing ${voters.length} voter(s)`}
      </Text>

      <TouchableOpacity
        style={[styles.button, { marginTop: 10, backgroundColor: Colors.accent }]}
        onPress={() => router.push('/(main)/voterlist')}
      >
        <Text style={styles.buttonText}>View Full Voter List</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{hasSearch ? 'Searching voters...' : 'Fetching all voters...'}</Text>
        </View>
      ) : voters.length ? (
        voters.map((v) => (
          <VoterCard
            key={v.voter_code /* use a stable key */}
            voter={v}
            onPress={() => openDetails(v)}
          />
        ))
      ) : (
        <Text style={styles.noDataText}>No voters found.</Text>
      )}
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
  }, button: {
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
});
