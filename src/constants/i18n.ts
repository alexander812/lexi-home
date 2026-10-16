export type Locale = 'en' | 'ru';

export const locales: Locale[] = ['en', 'ru'];
export const defaultLocale: Locale = 'en';

export const hreflangMap: Record<Locale, string> = {
  en: 'en',
  ru: 'ru',
};
