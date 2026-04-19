import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Languages, InputOptions } from '@/constants/Languages';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { scanLabel, scanBarcode, scanPill, scanText } from '@/api/client';
import type { Language } from '@/api/client';

export default function ScanScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [textQuery, setTextQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  const l = language as Language;

  const handleLabelScan = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    try {
      setLoading(true);
      setLoadingMsg('Reading label...');
      const data = await scanLabel(uri, l);
      router.push({ pathname: '/result/toxicology', params: { data: JSON.stringify(data) } });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not analyze label. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLabelFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    try {
      setLoading(true);
      setLoadingMsg('Analyzing label...');
      const data = await scanLabel(uri, l);
      router.push({ pathname: '/result/toxicology', params: { data: JSON.stringify(data) } });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not analyze label. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePillScan = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    try {
      setLoading(true);
      setLoadingMsg('Identifying pill...');
      const data = await scanPill(uri, l);
      router.push({ pathname: '/result/pill', params: { data: JSON.stringify(data) } });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not identify pill. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setShowBarcodeScanner(false);
    try {
      setLoading(true);
      setLoadingMsg(`Looking up ${barcode}...`);
      const data = await scanBarcode(barcode, l);
      router.push({ pathname: '/result/toxicology', params: { data: JSON.stringify(data) } });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Product not found. Try scanning the label instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!textQuery.trim()) return;
    try {
      setLoading(true);
      setLoadingMsg(`Analyzing ${textQuery}...`);
      const data = await scanText(textQuery.trim(), l);
      setShowTextInput(false);
      router.push({ pathname: '/result/toxicology', params: { data: JSON.stringify(data) } });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not find ingredient. Try a different name.');
    } finally {
      setLoading(false);
    }
  };

  const handleOption = (id: string) => {
    switch (id) {
      case 'label':
        Alert.alert('Scan Label', 'How do you want to add the label?', [
          { text: 'Take Photo', onPress: handleLabelScan },
          { text: 'From Gallery', onPress: handleLabelFromGallery },
          { text: 'Cancel', style: 'cancel' },
        ]);
        break;
      case 'barcode':
        setShowBarcodeScanner(true);
        break;
      case 'pill':
        handlePillScan();
        break;
      case 'text':
        setShowTextInput(true);
        break;
    }
  };

  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        onScanned={handleBarcodeScanned}
        onClose={() => setShowBarcodeScanner(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Language selector */}
        <LanguageSelector value={l} onChange={setLanguage} />

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>
            {l === 'en' ? 'Scan anything. Know if it\'s safe.' :
             l === 'hi' ? 'कुछ भी स्कैन करें। जानें कि यह सुरक्षित है।' :
             l === 'kn' ? 'ಏನನ್ನಾದರೂ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ. ಸುರಕ್ಷಿತವೇ ಎಂದು ತಿಳಿಯಿರಿ.' :
             'ఏదైనా స్కాన్ చేయండి. సురక్షితమో తెలుసుకోండి.'}
          </Text>
          <Text style={styles.taglineSub}>
            {l === 'en' ? 'In your language.' :
             l === 'hi' ? 'आपकी भाषा में।' :
             l === 'kn' ? 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.' :
             'మీ భాషలో.'}
          </Text>
        </View>

        {/* Input options grid */}
        <View style={styles.grid}>
          {InputOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOption(option.id)}
              activeOpacity={0.75}
            >
              <View style={styles.optionIconWrap}>
                <Ionicons name={option.icon as any} size={32} color={Colors.accent} />
              </View>
              <Text style={styles.optionLabel}>{option.labels[l]}</Text>
              <Text style={styles.optionDesc}>{option.description[l]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text search input */}
        {showTextInput && (
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLabel}>
              {l === 'en' ? 'Enter name of drug, herb, or ingredient:' :
               l === 'hi' ? 'दवा, जड़ी-बूटी या सामग्री का नाम दर्ज करें:' :
               l === 'kn' ? 'ಔಷಧ, ಗಿಡಮೂಲಿಕೆ ಅಥವಾ ಪದಾರ್ಥದ ಹೆಸರು ನಮೂದಿಸಿ:' :
               'మందు, మూలిక లేదా పదార్థం పేరు నమోదు చేయండి:'}
            </Text>
            <View style={styles.textInputRow}>
              <TextInput
                style={styles.textInput}
                value={textQuery}
                onChangeText={setTextQuery}
                placeholder={l === 'en' ? 'e.g. Paracetamol, Ashwagandha, MSG' :
                             l === 'hi' ? 'जैसे पैरासिटामोल, अश्वगंधा' :
                             l === 'kn' ? 'ಉದಾ: ಪ್ಯಾರಾಸಿಟಮಾಲ್, ಅಶ್ವಗಂಧ' :
                             'ఉదా: పారాసిటమాల్, అశ్వగంధ'}
                placeholderTextColor={Colors.textMuted}
                returnKeyType="search"
                onSubmitEditing={handleTextSearch}
                autoFocus
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleTextSearch}>
                <Ionicons name="search" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowTextInput(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>{loadingMsg}</Text>
            <Text style={styles.loadingSubText}>
              {l === 'en' ? 'Analyzing with AI...' :
               l === 'hi' ? 'AI से विश्लेषण हो रहा है...' :
               l === 'kn' ? 'AI ಯಿಂದ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' :
               'AI తో విశ్లేషిస్తోంది...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  taglineContainer: { marginBottom: 24, alignItems: 'center' },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  taglineSub: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accentLight,
    textAlign: 'center',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  optionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  textInputContainer: {
    marginTop: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  textInputRow: { flexDirection: 'row', gap: 8 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: { marginTop: 10, alignItems: 'center' },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 240,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  loadingSubText: { fontSize: 13, color: Colors.textSecondary },
});
