// app/components/UserDetails.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import useThemeColors from '../hooks/useThemeColors';

interface DetailRowProps {
  label: string;
  value: string | string[] | number | undefined;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  const Colors = useThemeColors();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: Colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: Colors.textDark }]}>
        {String(value || 'N/A')}
      </Text>
    </View>
  );
};

export default function UserDetails() {
  const Colors = useThemeColors();
  const params = useLocalSearchParams();
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
  } = params;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => router.back();

  const displayGender =
    gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : String(gender);

  const handlePrintToPDF = async () => {
    try {
      const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: ${Colors.surface};
              color: ${Colors.textDark};
              margin: 0;
              padding: 40px;
            }
            header {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              color: ${Colors.primary};
              margin-bottom: 20px;
            }
            .card {
              background-color: ${Colors.background};
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .cardTitle {
              font-size: 18px;
              font-weight: 700;
              color: ${Colors.textDark};
              border-bottom: 1px solid ${Colors.borderDefault};
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .detailRow {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
            }
            .label { color: ${Colors.textMuted}; font-weight: 500; }
            .value { font-weight: 600; color: ${Colors.textDark}; }
            .voterIdCard {
              background-color: ${Colors.primary};
              color: ${Colors.background};
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin-bottom: 20px;
            }
            .voterIdLabel { font-size: 14px; opacity: 0.7; text-transform: uppercase; margin-bottom: 5px; }
            .voterIdValue { font-size: 28px; font-weight: 800; letter-spacing: 1.5px; }
            footer {
              text-align: center;
              font-size: 12px;
              color: ${Colors.textMuted};
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
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
      }}
    >
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={handleBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={[styles.heading, { color: Colors.primary }]}>Voter Profile</Text>
      <Text style={[styles.subHeading, { color: Colors.textMuted }]}>
        Detailed information for the requested voter.
      </Text>

      <View style={[styles.voterIdCard, { backgroundColor: Colors.primary, shadowColor: Colors.primary }]}>
        <Text style={[styles.voterIdLabel, { color: Colors.background }]}>Voter ID</Text>
        <Text style={[styles.voterIdValue, { color: Colors.background }]}>{voterId}</Text>
      </View>

      <View style={[styles.detailsCard, { backgroundColor: Colors.background, shadowColor: '#000' }]}>
        <Text style={[styles.cardTitle, { color: Colors.textDark, borderBottomColor: Colors.borderDefault }]}>
          Personal Details
        </Text>
        <DetailRow label="Full Name" value={name} />
        <DetailRow label="Father/Husband Name" value={fatherName} />
        <DetailRow label="Gender" value={displayGender} />
        <DetailRow label="Age" value={age} />
        <DetailRow label="Mobile No." value={mobile} />
      </View>

      {(houseNumber || district) && (
        <View style={[styles.detailsCard, { backgroundColor: Colors.background, shadowColor: '#000' }]}>
          <Text style={[styles.cardTitle, { color: Colors.textDark, borderBottomColor: Colors.borderDefault }]}>
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

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={handlePrintToPDF}
          activeOpacity={0.9}
        >
          <Text style={[styles.actionButtonText, { color: Colors.background }]}>Print to PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accent }]}
          onPress={handleBack}
          activeOpacity={0.9}
        >
          <Text style={[styles.actionButtonText, { color: Colors.background }]}>Close Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  detailsCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backButton: { position: 'absolute', left: 20, zIndex: 10 },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
    textAlign: 'center',
  },
  subHeading: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  voterIdCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  voterIdLabel: { fontSize: 14, opacity: 0.7, marginBottom: 5, textTransform: 'uppercase' },
  voterIdValue: { fontSize: 28, fontWeight: '800', letterSpacing: 1.5 },
  detailLabel: { fontSize: 16, fontWeight: '500' },
  detailValue: { fontSize: 16, fontWeight: '600', textAlign: 'right', maxWidth: '50%' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginHorizontal: 5,
    width: '45%',
  },
  actionButtonText: { fontSize: 18, fontWeight: 'bold' },
});
