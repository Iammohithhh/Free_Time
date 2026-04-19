import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Languages } from '@/constants/Languages';
import { Colors } from '@/constants/Colors';
import type { Language } from '@/api/client';

type Props = {
  value: Language;
  onChange: (lang: Language) => void;
};

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {Languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.langBtn,
            value === lang.code && styles.langBtnActive,
          ]}
          onPress={() => onChange(lang.code)}
        >
          <Text style={[
            styles.langText,
            value === lang.code && styles.langTextActive,
          ]}>
            {lang.nativeLabel}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 20,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  langBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  langTextActive: {
    color: Colors.textPrimary,
  },
});
