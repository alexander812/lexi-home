import { defaultLocale, locales } from './i18n-text';

interface PathType {
  params: {
    locale?: string;
  };
}

export function getStaticPaths(): PathType[] {
  const allPaths: PathType[] = [];

  // Default locale — no prefix in URL
  allPaths.push({
    params: {
      locale: undefined,
    },
  });

  // Non-default locales — /ru, /ru/… etc.
  for (const locale of locales) {
    if (locale !== defaultLocale) {
      allPaths.push({
        params: {
          locale,
        },
      });
    }
  }

  return allPaths;
}
