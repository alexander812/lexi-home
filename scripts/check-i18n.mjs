#!/usr/bin/env node

/**
 * Checks that all i18n JSON files contain the same set of keys.
 * The English locale (en.json) is treated as the reference.
 *
 * Usage:  node scripts/check-i18n.mjs
 * Exit 1 if any locale has missing or extra keys.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const I18N_DIR = join(import.meta.dirname, '..', 'src', 'i18n');
const REFERENCE_LOCALE = 'en';

const files = readdirSync(I18N_DIR).filter(f => f.endsWith('.json'));
const dictionaries = {};

for (const file of files) {
  const locale = file.replace('.json', '');
  dictionaries[locale] = JSON.parse(readFileSync(join(I18N_DIR, file), 'utf-8'));
}

const referenceKeys = new Set(Object.keys(dictionaries[REFERENCE_LOCALE]));
let hasErrors = false;

for (const [locale, dict] of Object.entries(dictionaries)) {
  if (locale === REFERENCE_LOCALE) continue;

  const localeKeys = new Set(Object.keys(dict));

  const missing = [...referenceKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !referenceKeys.has(k));

  if (missing.length > 0) {
    hasErrors = true;
    console.error(`\n❌ [${locale}] Missing ${missing.length} key(s):`);
    for (const key of missing) {
      console.error(`   - ${key}`);
    }
  }

  if (extra.length > 0) {
    hasErrors = true;
    console.error(`\n⚠️  [${locale}] Extra ${extra.length} key(s) not in ${REFERENCE_LOCALE}:`);
    for (const key of extra) {
      console.error(`   - ${key}`);
    }
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✅ [${locale}] All ${referenceKeys.size} keys present`);
  }
}

if (hasErrors) {
  console.error('\ni18n check failed.');
  process.exit(1);
} else {
  console.log(`\nAll ${files.length} locales are in sync (${referenceKeys.size} keys each).`);
}
