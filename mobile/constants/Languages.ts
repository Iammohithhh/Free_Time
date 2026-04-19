export type Language = 'en' | 'hi' | 'kn' | 'te';

export const Languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export const InputOptions = [
  {
    id: 'label' as const,
    icon: 'camera',
    labels: {
      en: 'Photo of Label',
      hi: 'लेबल की फोटो',
      kn: 'ಲೇಬಲ್ ಫೋಟೋ',
      te: 'లేబుల్ ఫోటో',
    },
    description: {
      en: 'Take or upload a photo of any product label',
      hi: 'किसी भी उत्पाद लेबल की फोटो लें',
      kn: 'ಯಾವುದೇ ಉತ್ಪನ್ನ ಲೇಬಲ್‌ನ ಫೋಟೋ ತೆಗೆಯಿರಿ',
      te: 'ఏదైనా ఉత్పత్తి లేబుల్ ఫోటో తీయండి',
    },
  },
  {
    id: 'barcode' as const,
    icon: 'barcode',
    labels: {
      en: 'Scan Barcode',
      hi: 'बारकोड स्कैन',
      kn: 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನ್',
      te: 'బార్‌కోడ్ స్కాన్',
    },
    description: {
      en: 'Scan barcode to check product ingredients',
      hi: 'उत्पाद सामग्री जांचने के लिए बारकोड स्कैन करें',
      kn: 'ಉತ್ಪನ್ನ ಪದಾರ್ಥಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      te: 'ఉత్పత్తి పదార్థాలు తనిఖీ చేయడానికి బార్‌కోడ్ స్కాన్ చేయండి',
    },
  },
  {
    id: 'pill' as const,
    icon: 'medkit',
    labels: {
      en: 'Photo of Pill',
      hi: 'गोली की फोटो',
      kn: 'ಮಾತ್ರೆ ಫೋಟೋ',
      te: 'మాత్ర ఫోటో',
    },
    description: {
      en: 'Identify an unknown tablet or capsule',
      hi: 'अज्ञात टैबलेट या कैप्सूल की पहचान करें',
      kn: 'ಅಜ್ಞಾತ ಮಾತ್ರೆ ಅಥವಾ ಕ್ಯಾಪ್ಸೂಲ್ ಗುರುತಿಸಿ',
      te: 'తెలియని మాత్ర లేదా క్యాప్సూల్ గుర్తించండి',
    },
  },
  {
    id: 'text' as const,
    icon: 'search',
    labels: {
      en: 'Type Name',
      hi: 'नाम टाइप करें',
      kn: 'ಹೆಸರು ಟೈಪ್ ಮಾಡಿ',
      te: 'పేరు టైప్ చేయండి',
    },
    description: {
      en: 'Search any drug, herb or ingredient by name',
      hi: 'किसी दवा, जड़ी-बूटी या सामग्री को नाम से खोजें',
      kn: 'ಯಾವುದೇ ಔಷಧ, ಗಿಡಮೂಲಿಕೆ ಅಥವಾ ಪದಾರ್ಥವನ್ನು ಹೆಸರಿನಿಂದ ಹುಡುಕಿ',
      te: 'ఏదైనా మందు, మూలిక లేదా పదార్థాన్ని పేరు ద్వారా శోధించండి',
    },
  },
];
