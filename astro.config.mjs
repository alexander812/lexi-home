import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { defaultLocale, hreflangMap, locales } from './src/constants/i18n';

const SITE = 'https://lexi.casa';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
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
      serialize: item => {
        if (!item.links || item.links.some(link => link.lang === 'x-default')) {
          return item;
        }

        const defaultVersion = item.links.find(link => link.lang === defaultLocale);

        if (!defaultVersion) {
          return item;
        }

        return { ...item, links: [...item.links, { lang: 'x-default', url: defaultVersion.url }] };
      },
    }),
  ],
});
