import idLocale from './locales/id.json';
import enLocale from './locales/en.json';

export type Language = 'id' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  id: idLocale,
  en: enLocale,
};

export type TranslationKey = keyof typeof idLocale;

export function t(key: TranslationKey | string, language: Language = getInitialLanguage()): string {
  return translations[language][key] || translations.id[key] || key;
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('wp_language');
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // Storage may be unavailable; fall back to browser language.
  }

  const browserLanguage = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  return browserLanguage.startsWith('en') ? 'en' : 'id';
}

export function formatDateTime(
  value: string | number | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatTime(
  value: string | number | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' },
): string {
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}
