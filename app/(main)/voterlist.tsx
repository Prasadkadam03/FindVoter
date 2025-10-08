// app/(main)/voterlist.tsx
import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from '../hooks/useThemeColors';
import { fetchVoterList, Voter, errorToUserMessage } from '../../lib/api';

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  const Colors = useThemeColors();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: Colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: Colors.textDark }]}>
        {(value ?? 'N/A').toString()}
      </Text>
    </View>
  );
};

// Memoized card for perf on long lists
const VoterCard = memo(function VoterCard({
  voter,
  onPress,
}: {
  voter: Voter;
  onPress: () => void;
}) {
  const Colors = useThemeColors();
  const displayGender =
    voter.gender === 'M' ? 'Male' : voter.gender === 'F' ? 'Female' : voter.gender;

  return (
    <TouchableOpacity
      style={[styles.voterCard, { backgroundColor: Colors.background, shadowColor: '#000' }]}
      onPress={onPress}
      activeOpacity={0.85}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View style={[styles.voterIdCard, { backgroundColor: Colors.primary, shadowColor: Colors.primary }]}>
        <Text style={[styles.voterNameLabel, { color: Colors.background }]}>Voter Name</Text>
        <Text style={[styles.voterNameValue, { color: Colors.background }]} numberOfLines={1}>
          {voter.name}
        </Text>
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
});

export default function VoterListScreen() {
  const Colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  // Accept both possible param keys for father/husband
  const hfParam =
    typeof params.husband_father_name === 'string'
      ? params.husband_father_name
      : typeof params.fatherName === 'string'
      ? params.fatherName
      : undefined;

  const search = {
    voterId: typeof params.voterId === 'string' ? params.voterId : undefined,
    name: typeof params.name === 'string' ? params.name : undefined,
    husband_father_name: hfParam,
    gender: typeof params.gender === 'string' ? (params.gender as 'M' | 'F' | '') : undefined,
    age: typeof params.age === 'string' ? params.age : undefined,
    mobile: typeof params.mobile === 'string' ? params.mobile : undefined,
  };

  const hasSearch =
    !!search.voterId ||
    !!search.name ||
    !!search.husband_father_name ||
    !!search.gender ||
    !!search.age ||
    !!search.mobile;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchVoterList(hasSearch ? search : undefined);
      setVoters(list);
    } catch (err) {
      console.error('Voter list fetch failed:', err);
      Alert.alert('Load Failed', errorToUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [hasSearch, search?.voterId, search?.name, search?.husband_father_name, search?.gender, search?.age, search?.mobile]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetails = useCallback(
    (v: Voter) => {
      router.push({
        pathname: '/components/UserDetails',
        params: {
          voterId: v.voter_code,
          name: v.name,
          fatherName: v.husband_father_name, // details screen expects fatherName
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
    },
    [router]
  );

  const keyExtractor = useCallback((v: Voter) => v.voter_code, []);
  const renderItem = useCallback(
    ({ item }: { item: Voter }) => <VoterCard voter={item} onPress={() => openDetails(item)} />,
    [openDetails]
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 20, paddingHorizontal: 20, backgroundColor: 'transparent' },
        ]}
      >
        <Text style={[styles.heading, { color: Colors.primary }]}>Voter List</Text>
        <Text style={[styles.subHeading, { color: Colors.textMuted }]}>
          {loading
            ? 'Loading...'
            : hasSearch
            ? `Showing ${voters.length} result(s) for your search`
            : `Showing ${voters.length} voter(s)`}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.accent }]}
          onPress={() => router.push('/(main)/voterlist')}
          activeOpacity={0.9}
        >
          <Text style={[styles.buttonText, { color: Colors.background }]}>View Full Voter List</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.textMuted }]}>
            {hasSearch ? 'Searching voters...' : 'Fetching all voters...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={voters}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20, paddingHorizontal: 20 },
          ]}
          ListEmptyComponent={
            <Text style={[styles.noDataText, { color: Colors.error }]}>No voters found.</Text>
          }
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          // If API supports pagination, hook onEndReached here.
          refreshing={loading}
          // onRefresh={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center' },
  contentContainer: { paddingTop: 10 },
  backButton: { position: 'absolute', left: 20, zIndex: 10 },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  voterCard: {
    marginBottom: 22,
    padding: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  voterIdCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  voterNameLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  voterNameValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsCard: { paddingHorizontal: 10, paddingVertical: 5 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: { marginTop: 10 },
  noDataText: {
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
