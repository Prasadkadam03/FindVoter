import React from 'react';
import * as FileSystemLegacy from 'expo-file-system/legacy';
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

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | any;
}) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-base font-medium text-textmuted dark:text-dark-textmuted">
      {label}
    </Text>
    <Text className="text-base font-semibold text-textdark dark:text-dark-text max-w-[50%] text-right">
      {String(value || 'N/A')}
    </Text>
  </View>
);

// ---- helpers ----
const escapeHtml = (v?: string | number | null) => {
  const s = v == null ? '' : String(v);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const toStr = (v: any) => (Array.isArray(v) ? v[0] : v);

const joinUrl = (base?: string, path?: string) => {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return b && p ? `${b}/${p}` : (b || p);
};

export default function UserDetails() {
  const {
    id,
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

  const idStr = Array.isArray(id) ? id[0] : id;

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = rnUseColorScheme();

  const handleBack = () => router.back();

  const displayGender =
    gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : String(gender ?? '');

  const handlePrintToPDF = async () => {
    try {
      // 1) Build image URL from env and endpoint
      const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      const ENDPOINT = 'vandana_pelmahale.png';
      const httpUrl = joinUrl(BASE_URL, ENDPOINT);
      if (!httpUrl) {
        throw new Error(
          'Image base URL is not configured. Set EXPO_PUBLIC_API_URL or adjust the endpoint.'
        );
      }

      // 2) Download image to cache, then read as base64 (LEGACY API is safe for SDK 54)
      const fileName = `vandana_${Date.now()}.png`;
      const destUri = FileSystemLegacy.cacheDirectory + fileName;
      const { uri: fileUri, status } = await FileSystemLegacy.downloadAsync(
        httpUrl,
        destUri
      );
      if (status !== 200) {
        throw new Error(`Image download failed (status ${status})`);
      }

      const base64Image = await FileSystemLegacy.readAsStringAsync(fileUri, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });
      const dataUri = `data:image/png;base64,${base64Image}`;

      // 3) Marathi gender
      const marathiGender =
        (gender === 'M' && 'पुरुष') ||
        (gender === 'F' && 'महिला') ||
        (gender ? String(gender) : '');

      // 4) Safely escaped values (params can be string | string[])
      const safe = {
        id: escapeHtml(toStr(id)),
        voterId: escapeHtml(toStr(voterId)),
        name: escapeHtml(toStr(name)),
        fatherName: escapeHtml(toStr(fatherName)),
        houseNumber: escapeHtml(toStr(houseNumber)),
        age: escapeHtml(toStr(age)),
        marathiGender: escapeHtml(marathiGender),
      };

      // 5) HTML with embedded base64 image (reliable for expo-print on both platforms)
      const html = `
<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body{ margin:0; padding:32px; background:#fff; color:#111; font-family:-apple-system,Roboto,Arial,sans-serif; }
    .wrap{ max-width:900px; margin:0 auto; border:1px solid #eee; padding:24px; }
    .top{ display:grid; grid-template-columns:1fr 260px; gap:16px; align-items:start; padding:20px; }
    .heading{ text-align:center; margin-top:30%; }
    .badge{ display:inline-flex; align-items:center; justify-content:center; width:85px; height:85px; border-radius:50%; border:6px solid #F3C623; margin-bottom:8px; font-weight:800; color:#C30D0D; line-height:1; margin-top:12px; }
    .badge small{ display:block; font-weight:700; color:#000; font-size:14px; }
    .badge strong{ display:block; font-size:36px; margin-top:2px; }
    .title{ font-size:35px; font-weight:800; color:#D90429; margin:8px 0 4px; letter-spacing:.2px; text-align:center; }
    .subtitle{ font-size:25px; font-weight:800; color:#E31E24; margin:0 0 8px; text-align:center; }
    .photo{ width:100%; height:auto; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; }
    .photo img{ width:100%; height:100%; object-fit:cover; }
    .slip{ margin:18px 0 6px; border:3px solid #000; padding:12px; position:relative; }
    .slip-top{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px; }
    .box-num{ border:1px solid #000; padding:6px 12px; font-weight:700; min-width:82px; text-align:center; }
    .box-code{ font-weight:700; }
    .box-photo{ border:2px solid #000; width:120px; height:150px; display:flex; align-items:center; justify-content:center; font-size:14px; color:#666; text-align:center; overflow:hidden; }
    .box-photo img{ width:100%; height:100%; object-fit:cover; }
    .slip-row{ font-size:16px; margin:6px 0; display:flex; gap:6px; }
    .slip-row b{ min-width:140px; font-weight:700; }
    .footer{ text-align:center; margin-top:10px; font-weight:900; font-size:34px; color:#E31E24; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="heading">
        <div class="badge">
          <div>
            <small>प्रभाग क्र.</small>
            <strong>१</strong>
          </div>
        </div>
        <div class="title">सौ. वंदना गणेश पेलमहाले</div>
        <div class="subtitle">संचालक - सोहम मिसळ</div>
      </div>
      <div class="photo">
        <img src="${dataUri}" alt="photo" />
      </div>
    </div>

    <div class="slip">
      <div class="slip-top">
        <div>
          <div class="box-num">${safe.id}</div>
          <div class="slip-row"><b>नाव :</b> <span>${safe.name}</span></div>
          <div class="slip-row"><b>वडिलांचे नाव :</b> <span>${safe.fatherName}</span></div>
          <div class="slip-row"><b>घर क्रमांक :</b> <span>${safe.houseNumber}</span></div>
          <div class="slip-row"><b>वय :</b> <span>${safe.age}</span></div>
          <div class="slip-row"><b>लिंग :</b> <span>${safe.marathiGender}</span></div>
        </div>
        <div>
          <div class="box-code">${safe.voterId || 'ZXS8756652'}</div>
          <div class="box-photo">छायाचित्र<br/>उपलब्ध</div>
        </div>
      </div>
    </div>

    <div class="footer">आपली मिसळ सोहम मिसळ</div>
  </div>
</body>
</html>
      `;

      // 6) Generate PDF
      const { uri } = await Print.printToFileAsync({ html });

      // 7) Share or show success
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('PDF Ready', uri);
      }
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      Alert.alert('Error', err?.message || 'Failed to generate PDF.');
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
