import { defaultLocale, locales } from '../constants/i18n';
import type { Locale } from '../constants/i18n';
import en from '../i18n/en.json';
import ru from '../i18n/ru.json';

const dictionaries: Record<string, Record<string, string>> = { en, ru };

/** Union of all valid translation keys (derived from en.json) */
export type TranslationKey = keyof typeof en;

export function getLocaleFromPath(pathname: string): Locale {
  for (const loc of locales) {
    if (loc !== defaultLocale && pathname.startsWith(`/${loc}`)) {
      return loc;
    }
  }

  return defaultLocale;
}

export function t(locale: Locale, key: TranslationKey): string {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];

  if (import.meta.env.DEV && !(key in dict)) {
    console.warn(`[i18n] Missing key "${key}" for locale "${locale}"`);
  }

  return dict[key] ?? key;
}

/** Factory: creates a typed translator bound to a specific locale */
export function useTranslations(locale: Locale) {
  return (key: TranslationKey): string => t(locale, key);
}

/** Path of a page inside a locale: '/' for the default locale, '/ru/…' for the others */
export function localePath(locale: Locale, path = '/'): string {
  if (locale === defaultLocale) {
    return path;
  }

  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export { defaultLocale, hreflangMap, type Locale, locales } from '../constants/i18n';
