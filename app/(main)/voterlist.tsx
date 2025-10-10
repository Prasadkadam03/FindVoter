// app/(main)/voterlist.tsx
import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  useColorScheme as rnUseColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchVoterList, Voter, errorToUserMessage } from '../../lib/api';
import 'nativewind';

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm font-medium text-textmuted dark:text-dark-textmuted">{label}</Text>
      <Text className="text-sm font-semibold text-textdark dark:text-dark-text">{(value ?? 'N/A').toString()}</Text>
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
  const displayGender = voter.gender === 'M' ? 'Male' : voter.gender === 'F' ? 'Female' : voter.gender;

  return (
    <TouchableOpacity
      className="mb-5 rounded-xl p-3 bg-background dark:bg-dark-surface shadow-md"
      onPress={onPress}
      activeOpacity={0.85}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <View className="rounded-lg p-3 mb-3 items-center bg-primary dark:bg-accent">
        <Text className="text-xs uppercase opacity-80 text-background">Voter Name</Text>
        <Text className="text-xl font-extrabold text-background mt-1" numberOfLines={1}>
          {voter.name}
        </Text>
      </View>

      <View className="px-1">
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scheme = rnUseColorScheme();

  const iconPrimaryColor = scheme === 'dark' ? '#66A3FF' : '#0B3B77'; // matches Colors.primary / Dark.primary
  const iconMutedColor = scheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    if (typeof params.name === 'string' && params.name.length > 0) {
      setSearchName(params.name);
    }
  }, [params.name]);

  const load = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      const query = searchQuery ? { name: searchQuery } : undefined;
      const list = await fetchVoterList(query);
      setVoters(list);
    } catch (err) {
      console.error('Voter list fetch failed:', err);
      Alert.alert('Load Failed', errorToUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

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
          fatherName: v.husband_father_name,
          mobile: v.mobile,
          gender: v.gender,
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

  const handleSearch = () => {
    load(searchName.trim());
  };

  const handleReset = () => {
    setSearchName('');
    load();
  };

  const keyExtractor = useCallback((v: Voter) => v.voter_code, []);
  const renderItem = useCallback(
    ({ item }: { item: Voter }) => <VoterCard voter={item} onPress={() => openDetails(item)} />,
    [openDetails]
  );

  return (
    <View className="flex-1 bg-surface dark:bg-dark-background">

      {/* Header */}
      <View className="items-center pt-6 px-5" style={{ paddingTop: insets.top + 20 }}>
        <Text className="text-3xl font-extrabold text-center text-primary dark:text-accent">Voter List</Text>
        <Text className="text-base text-center text-textmuted dark:text-dark-textmuted mt-1 mb-4">
          {loading ? 'Loading...' : `Showing ${voters.length} results`}
        </Text>

        {/* Search Input */}
        <TextInput
          className="w-full border border-primary dark:border-accent rounded-lg px-4 py-3 text-base text-textdark dark:text-dark-text bg-background dark:bg-dark-surface"
          placeholder="Search by name"
          placeholderTextColor={scheme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
          value={searchName}
          onChangeText={setSearchName}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          style={{ borderColor: undefined }} 
        />

        {/* Buttons row */}
        <View className="flex-row w-full mt-3 mb-2">
          <TouchableOpacity
            className="flex-1 rounded-lg py-3 mr-2 mx-4 items-center justify-center bg-primary dark:bg-accent"
            onPress={handleSearch}
            activeOpacity={0.85}
          >
            <Text className="text-base font-bold text-background">Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-lg py-3 ml-2 mx-4 items-center justify-center bg-accent dark:bg-primary"
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text className="text-base font-bold text-background">Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="items-center justify-center pt-16">
          <ActivityIndicator size="large" color={iconPrimaryColor} />
          <Text className="mt-3 text-textmuted dark:text-dark-textmuted">
            {searchName ? 'Searching voters...' : 'Fetching all voters...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={voters}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 20,
          }}
          ListEmptyComponent={<Text className="text-center text-error mt-10">No voters found.</Text>}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
}
