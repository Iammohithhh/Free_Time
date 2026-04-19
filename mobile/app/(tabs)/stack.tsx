import { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColor } from '@/constants/Colors';
import { useLanguage } from '@/hooks/useLanguage';
import { useUser } from '@/hooks/useUser';
import { useStack } from '@/hooks/useStack';
import { searchDrug, searchHerb } from '@/api/client';

export default function StackScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const { userId } = useUser(language);
  const { stack, interactions, loading, refresh, add, remove, checkInteractions } = useStack(userId, language);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState(false);

  useEffect(() => {
    if (userId) refresh();
  }, [userId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const [drugs, herbs] = await Promise.all([
        searchDrug(searchQuery).catch(() => ({ results: [] })),
        searchHerb(searchQuery).catch(() => ({ results: [] })),
      ]);
      const drugResults = (drugs.results || []).map((d: any) => ({ ...d, _type: 'drug' }));
      const herbResults = (herbs.results || []).map((h: any) => ({ ...h, _type: 'herb' }));
      setSearchResults([...drugResults, ...herbResults]);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddItem = async (item: any) => {
    const payload = item._type === 'drug'
      ? { item_type: 'drug', drug_id: item.id }
      : { item_type: 'herb', herb_id: item.id };

    const result = await add(payload);
    setSearchResults([]);
    setSearchQuery('');

    if (result?.new_interactions_found > 0) {
      Alert.alert(
        '⚠️ Interaction Found',
        `${result.new_interactions_found} interaction(s) detected with your current stack. Check the Interactions tab.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddCustom = async () => {
    if (!searchQuery.trim()) return;
    await add({ item_type: 'supplement', custom_name: searchQuery.trim() });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCheckInteractions = async () => {
    try {
      setInteractionLoading(true);
      await checkInteractions();
      if (interactions) {
        router.push({ pathname: '/result/interactions', params: { data: JSON.stringify(interactions) } });
      }
    } finally {
      setInteractionLoading(false);
    }
    if (interactions) {
      router.push({ pathname: '/result/interactions', params: { data: JSON.stringify(interactions) } });
    }
  };

  const l = language;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>
          {l === 'en' ? 'My Medications & Herbs' :
           l === 'hi' ? 'मेरी दवाएं और जड़ी-बूटियां' :
           l === 'kn' ? 'ನನ್ನ ಔಷಧಗಳು ಮತ್ತು ಗಿಡಮೂಲಿಕೆಗಳು' :
           'నా మందులు మరియు మూలికలు'}
        </Text>
        <Text style={styles.subheading}>
          {l === 'en' ? 'Add everything you take — check all interactions at once.' :
           l === 'hi' ? 'जो कुछ भी लेते हैं जोड़ें — एक साथ सभी इंटरैक्शन जांचें।' :
           l === 'kn' ? 'ನೀವು ತೆಗೆದುಕೊಳ್ಳುವ ಎಲ್ಲವನ್ನೂ ಸೇರಿಸಿ — ಒಂದೇ ಬಾರಿ ಎಲ್ಲಾ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' :
           'మీరు తీసుకునేది అన్నీ జోడించండి — ఒకేసారి అన్ని ఇంటరాక్షన్‌లు తనిఖీ చేయండి.'}
        </Text>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={l === 'en' ? 'Search drug or herb name...' :
                         l === 'hi' ? 'दवा या जड़ी-बूटी खोजें...' :
                         l === 'kn' ? 'ಔಷಧ ಅಥವಾ ಗಿಡಮೂಲಿಕೆ ಹುಡುಕಿ...' :
                         'మందు లేదా మూలిక శోధించండి...'}
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            {searching
              ? <ActivityIndicator size="small" color={Colors.textPrimary} />
              : <Ionicons name="search" size={18} color={Colors.textPrimary} />
            }
          </TouchableOpacity>
        </View>

        {/* Search results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Select to add:</Text>
            {searchResults.slice(0, 8).map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resultItem}
                onPress={() => handleAddItem(item)}
              >
                <Ionicons
                  name={item._type === 'drug' ? 'medical' : 'leaf'}
                  size={16}
                  color={item._type === 'drug' ? Colors.accentLight : Colors.safe}
                />
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>
                    {item._type === 'drug' ? item.brand_name : item.common_name_en}
                  </Text>
                  <Text style={styles.resultSub}>
                    {item._type === 'drug' ? item.generic_name : item.botanical_name || item.common_name_hi || ''}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={22} color={Colors.accent} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCustomBtn} onPress={handleAddCustom}>
              <Ionicons name="add" size={16} color={Colors.accent} />
              <Text style={styles.addCustomText}>
                Add "{searchQuery}" as custom supplement
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current stack */}
        {stack.length > 0 ? (
          <View style={styles.stackContainer}>
            <Text style={styles.stackTitle}>
              {l === 'en' ? `Current Stack (${stack.length} items)` :
               l === 'hi' ? `वर्तमान स्टैक (${stack.length} आइटम)` :
               l === 'kn' ? `ಪ್ರಸ್ತುತ ಸ್ಟ್ಯಾಕ್ (${stack.length} ಐಟಂಗಳು)` :
               `ప్రస్తుత స్టాక్ (${stack.length} అంశాలు)`}
            </Text>
            {stack.map((item: any) => (
              <View key={item.id} style={styles.stackItem}>
                <Ionicons
                  name={item.drug ? 'medical' : item.herb ? 'leaf' : 'flask'}
                  size={20}
                  color={item.drug ? Colors.accentLight : item.herb ? Colors.safe : Colors.caution}
                />
                <View style={styles.stackItemText}>
                  <Text style={styles.stackItemName}>
                    {item.drug?.brand_name || item.herb?.name_en || item.custom_name}
                  </Text>
                  <Text style={styles.stackItemSub}>
                    {item.drug?.generic_name || item.herb?.botanical_name || item.item_type}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Remove?', `Remove ${item.drug?.brand_name || item.herb?.name_en || item.custom_name}?`, [
                    { text: 'Yes', onPress: () => remove(item.id), style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}>
                  <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStack}>
            <Ionicons name="layers-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              {l === 'en' ? 'Your stack is empty' :
               l === 'hi' ? 'आपका स्टैक खाली है' :
               l === 'kn' ? 'ನಿಮ್ಮ ಸ್ಟ್ಯಾಕ್ ಖಾಲಿಯಾಗಿದೆ' :
               'మీ స్టాక్ ఖాళీగా ఉంది'}
            </Text>
            <Text style={styles.emptySubText}>
              {l === 'en' ? 'Add your medications, supplements, and herbs to check interactions' :
               l === 'hi' ? 'इंटरैक्शन जांचने के लिए अपनी दवाएं, सप्लीमेंट और जड़ी-बूटियां जोड़ें' :
               l === 'kn' ? 'ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ಔಷಧಗಳನ್ನು, ಸಪ್ಲಿಮೆಂಟ್‌ಗಳನ್ನು ಮತ್ತು ಗಿಡಮೂಲಿಕೆಗಳನ್ನು ಸೇರಿಸಿ' :
               'ఇంటరాక్షన్‌లు తనిఖీ చేయడానికి మీ మందులు, సప్లిమెంట్లు మరియు మూలికలు జోడించండి'}
            </Text>
          </View>
        )}

        {/* Check interactions button */}
        {stack.length > 1 && (
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={handleCheckInteractions}
            disabled={interactionLoading}
          >
            {interactionLoading
              ? <ActivityIndicator color={Colors.textPrimary} />
              : <>
                  <Ionicons name="shield-checkmark" size={20} color={Colors.textPrimary} />
                  <Text style={styles.checkBtnText}>
                    {l === 'en' ? 'Check All Interactions' :
                     l === 'hi' ? 'सभी इंटरैक्शन जांचें' :
                     l === 'kn' ? 'ಎಲ್ಲಾ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' :
                     'అన్ని ఇంటరాక్షన్‌లు తనిఖీ చేయండి'}
                  </Text>
                </>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
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
  resultsContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsTitle: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultText: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  resultSub: { fontSize: 12, color: Colors.textSecondary },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
  },
  addCustomText: { fontSize: 13, color: Colors.accent },
  stackContainer: { marginBottom: 20 },
  stackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  stackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stackItemText: { flex: 1 },
  stackItemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stackItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  emptyStack: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },
  emptySubText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  checkBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  checkBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
