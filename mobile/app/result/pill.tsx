import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const CONFIDENCE_COLORS = {
  high: Colors.safe,
  medium: Colors.caution,
  low: Colors.danger,
};

export default function PillResult() {
  const { data } = useLocalSearchParams<{ data: string }>();

  if (!data) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>No data to display</Text>
      </View>
    );
  }

  const parsed = JSON.parse(data);
  const id = parsed.identification || parsed;
  const confidenceColor = CONFIDENCE_COLORS[id.confidence as keyof typeof CONFIDENCE_COLORS] || Colors.textMuted;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Physical description */}
      <View style={styles.descCard}>
        <Text style={styles.cardTitle}>Physical Description</Text>
        <View style={styles.descRow}>
          <View style={styles.descItem}>
            <Ionicons name="color-palette-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.descLabel}>Color</Text>
            <Text style={styles.descValue}>{id.color || '—'}</Text>
          </View>
          <View style={styles.descItem}>
            <Ionicons name="shapes-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.descLabel}>Shape</Text>
            <Text style={styles.descValue}>{id.shape || '—'}</Text>
          </View>
          <View style={styles.descItem}>
            <Ionicons name="text-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.descLabel}>Imprint</Text>
            <Text style={styles.descValue}>{id.imprint || 'None'}</Text>
          </View>
        </View>
      </View>

      {/* Confidence badge */}
      <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
        <Ionicons name="analytics-outline" size={20} color={confidenceColor} />
        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
          {id.confidence?.toUpperCase()} Confidence Match
        </Text>
      </View>

      {/* Possible medications */}
      {id.possible_medications?.length > 0 && (
        <View style={styles.medsSection}>
          <Text style={styles.sectionTitle}>Possible Medications</Text>
          {id.possible_medications.map((med: string, i: number) => (
            <View key={i} style={styles.medItem}>
              <Ionicons name="medkit-outline" size={16} color={Colors.accentLight} />
              <Text style={styles.medText}>{med}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Claude's explanation */}
      {id.note && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note</Text>
          <Text style={styles.noteText}>{id.note}</Text>
        </View>
      )}

      {/* Warning */}
      <View style={styles.warningCard}>
        <Ionicons name="warning-outline" size={18} color={Colors.warning} />
        <Text style={styles.warningText}>
          Pill identification from photos is not always accurate. Always verify with a pharmacist before taking any medication.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.textMuted, fontSize: 16 },
  descCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  descRow: { flexDirection: 'row', justifyContent: 'space-around' },
  descItem: { alignItems: 'center', gap: 4 },
  descLabel: { fontSize: 11, color: Colors.textMuted },
  descValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 2,
  },
  confidenceText: { fontSize: 14, fontWeight: '700' },
  medsSection: { marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  medItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  noteCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  noteText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  warningCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: `${Colors.warning}10`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
  },
  warningText: { flex: 1, fontSize: 13, color: Colors.warning, lineHeight: 18 },
});
