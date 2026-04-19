import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from '@/api/client';
import type { Language } from '@/api/client';

const USER_ID_KEY = '@veda_user_id';

export function useUser(language: Language) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(USER_ID_KEY);
      if (stored) {
        setUserId(stored);
      } else {
        try {
          const user = await createUser(language);
          await AsyncStorage.setItem(USER_ID_KEY, user.user_id);
          setUserId(user.user_id);
        } catch {
          // Will retry next time
        }
      }
    })();
  }, []);

  return { userId };
}
