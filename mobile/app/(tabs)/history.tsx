import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, StatusColor } from '@/constants/Colors';
import { useLanguage } from '@/hooks/useLanguage';

const HISTORY_KEY = '@veda_scan_history';

type HistoryItem = {
  id: string;
  type: 'label_photo' | 'barcode' | 'pill_photo' | 'text';
  query: string;
  result: any;
  timestamp: number;
  language: string;
};

const TYPE_ICONS: Record<string, string> = {
  label_photo: 'camera',
  barcode: 'barcode',
  pill_photo: 'medkit',
  text: 'search',
};

export default function HistoryScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((stored) => {
      if (stored) setHistory(JSON.parse(stored));
    });
  }, []);

  const clearHistory = async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const l = language;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>
            {l === 'en' ? 'Scan History' :
             l === 'hi' ? 'स्कैन इतिहास' :
             l === 'kn' ? 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ' :
             'స్కాన్ చరిత్ర'}
          </Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              {l === 'en' ? 'No scans yet' :
               l === 'hi' ? 'अभी कोई स्कैन नहीं' :
               l === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ' :
               'ఇంకా స్కాన్‌లు లేవు'}
            </Text>
            <Text style={styles.emptySubText}>
              {l === 'en' ? 'Your scans will appear here' :
               l === 'hi' ? 'आपके स्कैन यहाँ दिखाई देंगे' :
               l === 'kn' ? 'ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್‌ಗಳು ಇಲ್ಲಿ ತೋರಿಸುತ್ತವೆ' :
               'మీ స్కాన్‌లు ఇక్కడ కనిపిస్తాయి'}
            </Text>
          </View>
        ) : (
          history.map((item) => {
            const overallScore = item.result?.report?.overall_score || item.result?.overall_score;
            const color = overallScore ? StatusColor[overallScore as keyof typeof StatusColor] : Colors.textMuted;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  const screen = item.type === 'pill_photo' ? '/result/pill' : '/result/toxicology';
                  router.push({ pathname: screen as any, params: { data: JSON.stringify(item.result) } });
                }}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name={TYPE_ICONS[item.type] as any} size={20} color={Colors.accent} />
                </View>
                <View style={styles.historyText}>
                  <Text style={styles.historyQuery} numberOfLines={1}>{item.query}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(item.timestamp).toLocaleDateString()} · {item.language.toUpperCase()}
                  </Text>
                </View>
                {overallScore && (
                  <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.statusText, { color }]}>{overallScore.toUpperCase()}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  clearText: { fontSize: 14, color: Colors.danger },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },
  emptySubText: { fontSize: 13, color: Colors.textMuted },
  historyItem: {
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
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: `${Colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyText: { flex: 1 },
  historyQuery: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  historyTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
