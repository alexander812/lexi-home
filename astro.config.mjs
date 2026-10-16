import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { defaultLocale, hreflangMap, locales } from './src/constants/i18n';

const SITE = 'https://lexi.casa';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  compressHTML: true,
  build: { assetsInlineLimit: 0 },
  i18n: {
    locales: [...locales],
    defaultLocale,
  },
  integrations: [
    sitemap({
      filter: page => !page.includes('/404'),
      i18n: {
        defaultLocale,
        locales: hreflangMap,
      },
    }),
  ],
});
