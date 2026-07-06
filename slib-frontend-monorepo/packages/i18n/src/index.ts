import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: en,
  vi: vi,
};

i18n
  // Detect language from browser/localStorage
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không tìm thấy
    supportedLngs: ['en', 'vi'],
    
    interpolation: {
      escapeValue: false, // React đã tự động chống XSS
    },
    
    detection: {
      // Ưu tiên đọc từ localStorage trước, sau đó mới đến navigator
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Tự động lưu lựa chọn vào localStorage
    }
  });

export default i18n;
