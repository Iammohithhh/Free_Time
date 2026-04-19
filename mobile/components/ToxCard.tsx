import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, StatusColor } from '@/constants/Colors';

const STATUS_ICONS = {
  safe: 'checkmark-circle',
  caution: 'warning',
  warning: 'alert-circle',
  danger: 'close-circle',
};

type Ingredient = {
  name: string;
  status: string;
  concern: string | null;
  regulatory: string | null;
};

type Props = { ingredient: Ingredient };

export function ToxCard({ ingredient }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = StatusColor[ingredient.status as keyof typeof StatusColor] || Colors.textMuted;
  const icon = STATUS_ICONS[ingredient.status as keyof typeof STATUS_ICONS] || 'help-circle';
  const hasConcern = ingredient.concern && ingredient.concern !== 'null';

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={() => hasConcern && setExpanded(!expanded)}
      activeOpacity={hasConcern ? 0.75 : 1}
    >
      <View style={styles.header}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={styles.name} numberOfLines={expanded ? undefined : 1}>{ingredient.name}</Text>
        <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.badgeText, { color }]}>{ingredient.status?.toUpperCase()}</Text>
        </View>
        {hasConcern && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textMuted}
          />
        )}
      </View>

      {expanded && (
        <View style={styles.expanded}>
          {hasConcern && (
            <View style={styles.expandedRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.expandedText}>{ingredient.concern}</Text>
            </View>
          )}
          {ingredient.regulatory && (
            <View style={styles.expandedRow}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.expandedSubText}>{ingredient.regulatory}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  expanded: { marginTop: 12, gap: 8 },
  expandedRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  expandedText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  expandedSubText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
});
