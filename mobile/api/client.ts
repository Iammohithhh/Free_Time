import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export type Language = 'en' | 'hi' | 'kn' | 'te';

// ─── Scan APIs ────────────────────────────────────────────────────────────────

export async function scanLabel(imageUri: string, language: Language) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'label.jpg',
  } as any);
  formData.append('language', language);
  const { data } = await api.post('/scan/label', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function scanBarcode(barcode: string, language: Language) {
  const formData = new FormData();
  formData.append('barcode', barcode);
  formData.append('language', language);
  const { data } = await api.post('/scan/barcode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function scanPill(imageUri: string, language: Language) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'pill.jpg',
  } as any);
  formData.append('language', language);
  const { data } = await api.post('/scan/pill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function scanText(query: string, language: Language) {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('language', language);
  const { data } = await api.post('/scan/text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ─── Stack APIs ───────────────────────────────────────────────────────────────

export async function createUser(language: Language) {
  const { data } = await api.post(`/stack/user?language=${language}`);
  return data;
}

export async function getStack(userId: string) {
  const { data } = await api.get(`/stack/${userId}`);
  return data;
}

export async function addToStack(userId: string, item: {
  item_type: string;
  drug_id?: string;
  herb_id?: string;
  custom_name?: string;
}, language: Language) {
  const { data } = await api.post(`/stack/${userId}/add?language=${language}`, item);
  return data;
}

export async function removeFromStack(userId: string, itemId: string) {
  const { data } = await api.delete(`/stack/${userId}/remove/${itemId}`);
  return data;
}

export async function getStackInteractions(userId: string, language: Language) {
  const { data } = await api.get(`/stack/${userId}/interactions?language=${language}`);
  return data;
}

// ─── Search APIs ──────────────────────────────────────────────────────────────

export async function searchDrug(query: string) {
  const { data } = await api.get(`/drug/search?q=${encodeURIComponent(query)}`);
  return data;
}

export async function searchHerb(query: string) {
  const { data } = await api.get(`/herb/search?q=${encodeURIComponent(query)}`);
  return data;
}

export async function searchChemical(name: string, language: Language) {
  const { data } = await api.get(`/chemical/search/${encodeURIComponent(name)}?language=${language}`);
  return data;
}
