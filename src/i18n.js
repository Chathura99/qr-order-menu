import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // Load translations using http
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // Default language
    debug: true, // Set to false in production
    interpolation: {
      escapeValue: false // React already does escaping
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json' // Path to translations
    }
  });

export default i18n;
