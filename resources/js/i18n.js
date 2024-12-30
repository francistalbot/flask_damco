import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: "/translations/{{lng}}", // Appel à votre API Laravel
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // React protège déjà contre les XSS
        },
    });

export default i18n;

// Exporter les fonctions utiles
export const t = (key, options) => i18n.t(key, options);
export const changeLanguage = (lang) => i18n.changeLanguage(lang);
