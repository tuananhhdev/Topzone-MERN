import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file JSON chứa nội dung đa ngôn ngữ
import en from '../locales/en.json';
import vi from '../locales/vi.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ
  .use(initReactI18next) // Tích hợp với React
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en', // Ngôn ngữ mặc định
    interpolation: {
      escapeValue: false, // Không mã hóa HTML
    },
  });

export default i18n;
