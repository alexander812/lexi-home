#!/usr/bin/env node

/**
 * Generates 1200×630 Open Graph images for the landing page.
 *
 * Text is rendered by sharp/librsvg with the system font stack below.
 * The generated files are committed, so CI only needs the PNGs:
 *
 *   public/og/lexi-en.png
 *   public/og/lexi-ru.png
 *
 * Usage: npm run og
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const OUTPUT_DIR = join(ROOT, 'public', 'og');

const WIDTH = 1200;
const HEIGHT = 630;

const locales = {
  en: {
    badge: 'FREE · NO SUBSCRIPTIONS',
    title: ['Words that', 'finally stick'],
    subtitle: ['Free vocabulary trainer for', 'words and phrases'],
    chips: ['Flashcards', 'Voice check', 'Ready courses'],
  },
  ru: {
    badge: 'БЕСПЛАТНО · БЕЗ ПОДПИСОК',
    title: ['Слова, которые', 'наконец запоминаются'],
    titleSize: 56,
    titleLineHeight: 64,
    subtitle: ['Бесплатный тренажёр для', 'слов и выражений'],
    chips: ['Карточки', 'Голос', 'Курсы'],
  },
};

const escapeXml = value =>
  value.replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]);

const emblem = await readFile(join(ROOT, 'public', 'emblem.svg'));
const emblemData = `data:image/svg+xml;base64,${emblem.toString('base64')}`;

const screen = await sharp(join(ROOT, 'src', 'assets', 'screenshots', 'card.png'))
  .resize({ height: 566, fit: 'inside' })
  .toBuffer();

const screenMeta = await sharp(screen).metadata();

if (!screenMeta.width || !screenMeta.height) {
  throw new Error('Could not read screenshot dimensions');
}

const radius = 34;
const framePadding = 8;

const roundedScreen = await sharp(screen)
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${screenMeta.width}" height="${screenMeta.height}"><rect width="100%" height="100%" rx="${radius}" fill="#fff"/></svg>`,
      ),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();

const frameWidth = screenMeta.width + framePadding * 2;
const frameHeight = screenMeta.height + framePadding * 2;

const phone = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}"><rect width="100%" height="100%" rx="${radius + framePadding}" fill="rgba(246,247,255,0.14)"/></svg>`,
  ),
)
  .composite([{ input: roundedScreen, top: framePadding, left: framePadding }])
  .png()
  .toBuffer();

const phoneLeft = WIDTH - frameWidth - 72;
const phoneTop = Math.round((HEIGHT - frameHeight) / 2);

const buildBackground = data => `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="18%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#4763f0" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#4763f0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="85%" cy="100%" r="55%">
      <stop offset="0%" stop-color="#4763f0" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#4763f0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f6f7ff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#f6f7ff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#050505"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>

  <g opacity="0.55">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${72 + i * 60}" y1="0" x2="${72 + i * 60}" y2="${HEIGHT}" stroke="#f6f7ff" stroke-opacity="0.035"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${70 + i * 90}" x2="${WIDTH}" y2="${70 + i * 90}" stroke="#f6f7ff" stroke-opacity="0.035"/>`).join('')}
  </g>

  <image href="${emblemData}" x="72" y="58" width="58" height="53"/>
  <text x="148" y="101" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="40" font-weight="700" letter-spacing="-1.5" fill="#f6f7ff">Lexi</text>

  <rect x="72" y="153" width="22" height="22" rx="6" fill="#4763f0"/>
  <text x="106" y="170" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="1.6" fill="#b8c0da">${escapeXml(data.badge)}</text>

  ${data.title
    .map(
      (line, index) =>
        `<text x="72" y="${251 + index * (data.titleLineHeight ?? 68)}" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="${data.titleSize ?? 62}" font-weight="800" letter-spacing="-2.4" fill="#f6f7ff">${escapeXml(line)}</text>`,
    )
    .join('')}

  ${data.subtitle
    .map(
      (line, index) =>
        `<text x="74" y="${408 + index * 34}" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="25" font-weight="400" fill="#aeb4c7">${escapeXml(line)}</text>`,
    )
    .join('')}

  ${data.chips
    .map((chip, index) => {
      const x = 72 + index * 166;
      return `<g><rect x="${x}" y="514" width="146" height="44" rx="22" fill="#f6f7ff" fill-opacity="0.06" stroke="#f6f7ff" stroke-opacity="0.12"/><circle cx="${x + 22}" cy="536" r="4" fill="#4763f0"/><text x="${x + 36}" y="543" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="17" font-weight="500" fill="#e4e7f2">${escapeXml(chip)}</text></g>`;
    })
    .join('')}

  <line x1="72" y1="590" x2="470" y2="590" stroke="url(#line)"/>
  <text x="72" y="612" font-family="Helvetica Neue, Inter, Arial, sans-serif" font-size="16" font-weight="500" letter-spacing="0.8" fill="#7f879c">LEXI.CASA</text>
</svg>`;

await mkdir(OUTPUT_DIR, { recursive: true });

for (const [locale, data] of Object.entries(locales)) {
  const image = await sharp(Buffer.from(buildBackground(data)))
    .composite([{ input: phone, top: phoneTop, left: phoneLeft }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const file = join(OUTPUT_DIR, `lexi-${locale}.png`);
  await writeFile(file, image);
  console.log(`✓ ${file.replace(`${ROOT}/`, '')} (${Math.round(image.length / 1024)} KB)`);
}
