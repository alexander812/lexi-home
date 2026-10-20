import type { FaqItem } from '../constants/faq';
import type { Locale } from '../constants/i18n';
import { APP_URL, ANDROID_APK_URL } from '../constants/links';
import { localePath, t } from './i18n-text';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  ru: 'ru_RU',
};

const FEATURE_KEYS = [
  'schema_feature_1',
  'schema_feature_2',
  'schema_feature_3',
  'schema_feature_4',
  'schema_feature_5',
] as const;

const VIDEOS = [
  {
    slug: 'overview',
    title: 'videos_card_tour_title',
    description: 'videos_card_tour_text',
    duration: 'PT3M35S',
  },
  {
    slug: 'task',
    title: 'videos_card_task_title',
    description: 'videos_card_task_text',
    duration: 'PT2M53S',
  },
  {
    slug: 'settings',
    title: 'videos_card_settings_title',
    description: 'videos_card_settings_text',
    duration: 'PT3M15S',
  },
  {
    slug: 'add-ready-course',
    title: 'videos_card_course_title',
    description: 'videos_card_course_text',
    duration: 'PT16S',
  },
] as const;

export function getOgImageUrl(site: URL | string, locale: Locale): string {
  return new URL(`/og/lexi-${locale}.png`, site).href;
}

export function getOgLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

export function getOgLocaleAlternate(locale: Locale): string {
  return locale === 'en' ? OG_LOCALES.ru : OG_LOCALES.en;
}

/**
 * JSON-LD for the landing page: Organization, WebSite, WebPage,
 * SoftwareApplication, FAQPage and VideoObject entities.
 */
export function buildStructuredData(locale: Locale, site: URL | string, faqItems: FaqItem[]): Record<string, unknown> {
  const base = new URL('/', site).href.replace(/\/$/, '');
  const canonical = new URL(localePath(locale), site).href;
  const ogImage = getOgImageUrl(site, locale);

  const organizationId = `${base}/#organization`;
  const websiteId = `${base}/#website`;
  const webPageId = `${canonical}#webpage`;
  const appId = `${base}/#app`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Lexi',
      url: `${base}/`,
      logo: new URL('/icons/icon-512.png', site).href,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${base}/`,
      name: 'Lexi',
      description: t(locale, 'meta_description'),
      inLanguage: ['en', 'ru'],
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': webPageId,
      url: canonical,
      name: t(locale, 'meta_title'),
      description: t(locale, 'meta_description'),
      inLanguage: locale,
      isPartOf: { '@id': websiteId },
      about: { '@id': appId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: ogImage,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': appId,
      name: 'Lexi',
      url: `${base}/`,
      mainEntityOfPage: { '@id': webPageId },
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Language Learning',
      operatingSystem: 'Android, Web',
      description: t(locale, 'meta_description'),
      inLanguage: ['ru', 'en', 'es', 'fr'],
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      installUrl: APP_URL,
      downloadUrl: ANDROID_APK_URL,
      image: ogImage,
      featureList: FEATURE_KEYS.map(key => t(locale, key)),
      publisher: { '@id': organizationId },
    },
  ];

  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      isPartOf: { '@id': webPageId },
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  for (const video of VIDEOS) {
    graph.push({
      '@type': 'VideoObject',
      '@id': `${canonical}#video-${video.slug}`,
      name: t(locale, video.title),
      description: t(locale, video.description),
      thumbnailUrl: new URL(`/videos/${video.slug}.jpg`, site).href,
      contentUrl: new URL(`/videos/${video.slug}.mp4`, site).href,
      duration: video.duration,
      uploadDate: '2026-10-16T19:41:32+03:00',
      inLanguage: 'ru',
      isFamilyFriendly: true,
      publisher: { '@id': organizationId },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
