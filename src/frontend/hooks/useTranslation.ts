import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import type { TranslationKey, LanguageCode } from '../translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    const translationSet = translations[key];
    if (translationSet) {
      // Use the current language, or fallback to English if the translation is missing
      return translationSet[language as LanguageCode] || translationSet['en'];
    }
    // If the key itself is missing, return the key as a fallback
    console.warn(`Translation key "${key}" not found.`);
    return key;
  };

  return t;
};