import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, StatusColor } from '@/constants/Colors';
import { OverallScore } from '@/components/OverallScore';
import { ToxCard } from '@/components/ToxCard';

export default function ToxicologyResult() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  if (!data) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>No data to display</Text>
      </View>
    );
  }

  const parsed = JSON.parse(data);
  const report = parsed.report || parsed;
  const productName = parsed.product_name || parsed.product?.name;
  const brand = parsed.brand || parsed.product?.brand;
  const ingredientsFound = parsed.ingredients_found || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Product header */}
      {(productName || brand) && (
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{productName || 'Unknown Product'}</Text>
          {brand && <Text style={styles.productBrand}>{brand}</Text>}
        </View>
      )}

      {/* Overall score */}
      <OverallScore score={report.overall_score} />

      {/* Summary */}
      {report.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>{report.summary}</Text>
        </View>
      )}

      {/* Per-ingredient cards */}
      {report.ingredients?.length > 0 && (
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>
            Ingredient Analysis ({report.ingredients.length})
          </Text>
          {report.ingredients.map((ing: any, i: number) => (
            <ToxCard key={i} ingredient={ing} />
          ))}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          This is for informational purposes. Consult a doctor or pharmacist for medical decisions.
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
  productHeader: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  productBrand: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  ingredientsSection: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
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
