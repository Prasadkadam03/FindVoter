import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme as rnUseColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const DetailRow = ({ label, value }: { label: string; value: string | number | undefined | any }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-base font-medium text-textmuted dark:text-dark-textmuted">
      {label}
    </Text>
    <Text className="text-base font-semibold text-textdark dark:text-dark-text max-w-[50%] text-right">
      {String(value || 'N/A')}
    </Text>
  </View>
);

export default function UserDetails() {
  const {
    voterId,
    name,
    fatherName,
    mobile,
    age,
    gender,
    houseNumber,
    sectionName,
    town,
    policeStation,
    taluka,
    district,
    pinCode,
  } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = rnUseColorScheme();

  const handleBack = () => router.back();

  const displayGender =
    gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : String(gender ?? '');

  const handlePrintToPDF = async () => {
    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #F6F7F9;
            color: #1F2937;
            margin: 0;
            padding: 40px;
          }
          header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #0B3B77;
            margin-bottom: 20px;
          }
          .card {
            background-color: #FFFFFF;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .cardTitle {
            font-size: 18px;
            font-weight: 700;
            color: inherit;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .detailRow {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
          }
          .label {
            color: #6B7280;
            font-weight: 500;
          }
          .value {
            font-weight: 600;
          }
          .voterIdCard {
            background-color: #0B3B77;
            color: #FFFFFF;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
          }
          .voterIdLabel {
            font-size: 14px;
            opacity: 0.7;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .voterIdValue {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 1.5px;
          }
          footer {
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <header>Find Voter App</header>
        <div class="voterIdCard">
          <span class="voterIdLabel">Voter ID</span>
          <div class="voterIdValue">${voterId ?? ''}</div>
        </div>
        <div class="card">
          <div class="cardTitle">Personal Details</div>
          <div class="detailRow"><span class="label">Full Name:</span><span class="value">${name ?? ''}</span></div>
          <div class="detailRow"><span class="label">Father/Husband Name:</span><span class="value">${fatherName ?? ''}</span></div>
          <div class="detailRow"><span class="label">Gender:</span><span class="value">${displayGender}</span></div>
          <div class="detailRow"><span class="label">Age:</span><span class="value">${age ?? ''}</span></div>
          <div class="detailRow"><span class="label">Mobile No.:</span><span class="value">${mobile ?? ''}</span></div>
        </div>
        ${(houseNumber || district) ? `
        <div class="card">
          <div class="cardTitle">Address Details</div>
          <div class="detailRow"><span class="label">House No.:</span><span class="value">${houseNumber ?? ''}</span></div>
          <div class="detailRow"><span class="label">Section:</span><span class="value">${sectionName ?? ''}</span></div>
          <div class="detailRow"><span class="label">Town/Village:</span><span class="value">${town ?? ''}</span></div>
          <div class="detailRow"><span class="label">Police Station:</span><span class="value">${policeStation ?? ''}</span></div>
          <div class="detailRow"><span class="label">Taluka:</span><span class="value">${taluka ?? ''}</span></div>
          <div class="detailRow"><span class="label">District:</span><span class="value">${district ?? ''}</span></div>
          <div class="detailRow"><span class="label">PIN Code:</span><span class="value">${pinCode ?? ''}</span></div>
        </div>` : ''}
        <footer>© Find Voter App — All Rights Reserved</footer>
      </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('PDF Ready', 'PDF saved locally.', [{ text: 'OK' }]);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };


  return (
    <ScrollView
      className="flex-1 bg-surface dark:bg-dark-background px-5"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <TouchableOpacity
        onPress={handleBack}
        className="absolute left-5 z-10"
        style={{ top: insets.top + 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={scheme === 'dark' ? '#66A3FF' : '#0B3B77'} />
      </TouchableOpacity>

      <Text className="text-3xl font-extrabold text-primary dark:text-accent text-center mb-1">
        Voter Profile
      </Text>
      <Text className="text-base text-center text-textmuted dark:text-dark-textmuted mb-5">
        Detailed information for the requested voter.
      </Text>

      {/* Voter ID Card */}
      <View className="bg-primary dark:bg-accent p-5 rounded-xl mb-6 items-center shadow-md">
        <Text className="text-xs uppercase opacity-80 text-background mb-1">Voter ID</Text>
        <Text className="text-[28px] font-extrabold tracking-wider text-background">{voterId}</Text>
      </View>

      {/* Personal Details */}
      <View className="bg-background dark:bg-dark-surface p-5 rounded-xl mb-6 shadow-sm">
        <Text className="text-lg font-bold border-b border-border dark:border-dark-border pb-2 mb-3 text-textdark dark:text-dark-text">
          Personal Details
        </Text>
        <DetailRow label="Full Name" value={name} />
        <DetailRow label="Father/Husband Name" value={fatherName} />
        <DetailRow label="Gender" value={displayGender} />
        <DetailRow label="Age" value={age} />
        <DetailRow label="Mobile No." value={mobile} />
      </View>

      {/* Address Details (only if available) */}
      {(houseNumber || district) && (
        <View className="bg-background dark:bg-dark-surface p-5 rounded-xl mb-6 shadow-sm">
          <Text className="text-lg font-bold border-b border-border dark:border-dark-border pb-2 mb-3 text-textdark dark:text-dark-text">
            Address Details
          </Text>
          <DetailRow label="House No." value={houseNumber} />
          <DetailRow label="Section" value={sectionName} />
          <DetailRow label="Town/Village" value={town} />
          <DetailRow label="Police Station" value={policeStation} />
          <DetailRow label="Taluka" value={taluka} />
          <DetailRow label="District" value={district} />
          <DetailRow label="PIN Code" value={pinCode} />
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between space-x-4">
        <TouchableOpacity
          onPress={handlePrintToPDF}
          className="flex-1 bg-primary dark:bg-accent py-4 mx-4 rounded-xl items-center"
        >
          <Text className="text-background dark:text-dark-background text-base font-bold">
            Print to PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBack}
          className="flex-1 bg-accent dark:bg-primary py-4 mx-4 rounded-xl items-center"
        >
          <Text className="text-background dark:text-dark-background text-base font-bold">
            Close Profile
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
