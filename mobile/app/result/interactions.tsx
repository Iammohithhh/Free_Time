import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColor } from '@/constants/Colors';
import { InteractionAlert } from '@/components/InteractionAlert';

const RISK_ICONS: Record<string, string> = {
  safe: 'shield-checkmark',
  moderate_risk: 'warning',
  high_risk: 'alert-circle',
};

const RISK_COLORS: Record<string, string> = {
  safe: Colors.safe,
  moderate_risk: Colors.caution,
  high_risk: Colors.danger,
};

export default function InteractionsResult() {
  const { data } = useLocalSearchParams<{ data: string }>();

  if (!data) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>No data to display</Text>
      </View>
    );
  }

  const parsed = JSON.parse(data);
  const report = parsed.report;
  const stackNames: string[] = parsed.stack_names || [];
  const schedule: string | null = parsed.optimized_schedule || null;

  const riskColor = report ? RISK_COLORS[report.risk_level] || Colors.textMuted : Colors.textMuted;
  const riskIcon = report ? RISK_ICONS[report.risk_level] || 'help-circle' : 'help-circle';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Stack summary */}
      <View style={styles.stackSummary}>
        <Text style={styles.stackSummaryTitle}>Your Stack</Text>
        <View style={styles.stackPills}>
          {stackNames.map((name, i) => (
            <View key={i} style={styles.stackPill}>
              <Text style={styles.stackPillText}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Risk level */}
      {report && (
        <View style={[styles.riskCard, { borderColor: riskColor }]}>
          <Ionicons name={riskIcon as any} size={32} color={riskColor} />
          <View style={styles.riskText}>
            <Text style={[styles.riskLevel, { color: riskColor }]}>
              {report.risk_level === 'safe' ? 'No Significant Interactions' :
               report.risk_level === 'moderate_risk' ? 'Moderate Risk — Read Below' :
               'High Risk — Consult Doctor'}
            </Text>
            {report.summary && (
              <Text style={styles.riskSummary}>{report.summary}</Text>
            )}
          </View>
        </View>
      )}

      {/* Interaction alerts */}
      {report?.alerts?.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            Interactions Found ({report.alerts.length})
          </Text>
          {report.alerts.map((alert: any, i: number) => (
            <InteractionAlert key={i} alert={alert} />
          ))}
        </View>
      )}

      {/* Dosing schedule */}
      {schedule && (
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>
            <Ionicons name="calendar" size={14} color={Colors.accentLight} /> Suggested Schedule
          </Text>
          <Text style={styles.scheduleText}>{schedule}</Text>
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          This information is for reference only. Always consult your doctor or pharmacist before combining medications, herbs, or supplements.
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
  stackSummary: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stackSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  stackPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stackPill: {
    backgroundColor: `${Colors.accent}20`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${Colors.accent}40`,
  },
  stackPillText: { fontSize: 12, color: Colors.accentLight, fontWeight: '600' },
  riskCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  riskText: { flex: 1 },
  riskLevel: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  riskSummary: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  alertsSection: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  scheduleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentLight,
  },
  scheduleTitle: { fontSize: 13, fontWeight: '700', color: Colors.accentLight, marginBottom: 8 },
  scheduleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
});
