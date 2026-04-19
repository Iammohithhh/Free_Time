import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '@/api/client';

const LANGUAGE_KEY = '@veda_language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored) setLanguageState(stored as Language);
      setLoaded(true);
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  return { language, setLanguage, loaded };
}
