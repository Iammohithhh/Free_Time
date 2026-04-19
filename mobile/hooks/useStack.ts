import { useState, useCallback } from 'react';
import { getStack, addToStack, removeFromStack, getStackInteractions } from '@/api/client';
import type { Language } from '@/api/client';

export function useStack(userId: string | null, language: Language) {
  const [stack, setStack] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getStack(userId);
      setStack(data.stack);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const add = useCallback(async (item: {
    item_type: string;
    drug_id?: string;
    herb_id?: string;
    custom_name?: string;
  }) => {
    if (!userId) return null;
    try {
      const result = await addToStack(userId, item, language);
      await refresh();
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [userId, language, refresh]);

  const remove = useCallback(async (itemId: string) => {
    if (!userId) return;
    try {
      await removeFromStack(userId, itemId);
      setStack((prev) => prev.filter((s) => s.id !== itemId));
    } catch (e: any) {
      setError(e.message);
    }
  }, [userId]);

  const checkInteractions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getStackInteractions(userId, language);
      setInteractions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  return { stack, interactions, loading, error, refresh, add, remove, checkInteractions };
}
