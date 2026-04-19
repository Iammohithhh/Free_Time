import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, StatusColor } from '@/constants/Colors';

const SCORE_CONFIG = {
  safe: {
    icon: 'shield-checkmark',
    label: 'SAFE',
    description: 'No significant concerns found',
  },
  caution: {
    icon: 'warning',
    label: 'USE CAUTION',
    description: 'Some ingredients to be aware of',
  },
  warning: {
    icon: 'alert-circle',
    label: 'WARNING',
    description: 'Contains concerning ingredients',
  },
  danger: {
    icon: 'close-circle',
    label: 'DANGER',
    description: 'Contains seriously harmful ingredients',
  },
};

type Props = { score: string };

export function OverallScore({ score }: Props) {
  const config = SCORE_CONFIG[score as keyof typeof SCORE_CONFIG] || SCORE_CONFIG.caution;
  const color = StatusColor[score as keyof typeof StatusColor] || Colors.caution;

  return (
    <View style={[styles.container, { borderColor: color, backgroundColor: `${color}12` }]}>
      <Ionicons name={config.icon as any} size={40} color={color} />
      <View style={styles.text}>
        <Text style={[styles.label, { color }]}>{config.label}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
  },
  text: { flex: 1 },
  label: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  description: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
});
