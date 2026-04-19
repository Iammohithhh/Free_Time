import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColor } from '@/constants/Colors';

const SEVERITY_ICONS = {
  major: 'close-circle',
  moderate: 'alert-circle',
  minor: 'warning',
};

const SEVERITY_LABELS = {
  major: 'MAJOR — Avoid',
  moderate: 'MODERATE — Caution',
  minor: 'MINOR — Monitor',
};

type Alert = {
  severity: string;
  items_involved: string[];
  what_happens: string;
  what_to_do: string;
};

type Props = { alert: Alert };

export function InteractionAlert({ alert }: Props) {
  const [expanded, setExpanded] = useState(alert.severity === 'major');
  const color = SeverityColor[alert.severity as keyof typeof SeverityColor] || Colors.textMuted;
  const icon = SEVERITY_ICONS[alert.severity as keyof typeof SEVERITY_ICONS] || 'alert-circle';
  const label = SEVERITY_LABELS[alert.severity as keyof typeof SEVERITY_LABELS] || alert.severity.toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <Ionicons name={icon as any} size={20} color={color} />
        <View style={styles.headerText}>
          <Text style={[styles.severityLabel, { color }]}>{label}</Text>
          <Text style={styles.itemsInvolved} numberOfLines={1}>
            {alert.items_involved?.join(' + ')}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </View>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.bodySection}>
            <Text style={styles.bodyLabel}>What can happen:</Text>
            <Text style={styles.bodyText}>{alert.what_happens}</Text>
          </View>
          <View style={[styles.bodySection, styles.actionSection]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.safe} />
            <View style={styles.actionText}>
              <Text style={styles.bodyLabel}>What to do:</Text>
              <Text style={styles.bodyText}>{alert.what_to_do}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1 },
  severityLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  itemsInvolved: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  body: { marginTop: 14, gap: 12 },
  bodySection: { gap: 4 },
  bodyLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  bodyText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  actionSection: { flexDirection: 'row', gap: 8 },
  actionText: { flex: 1 },
});
