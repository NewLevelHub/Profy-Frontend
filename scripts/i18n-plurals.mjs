/**
 * KZ-209 — plural-forms audit.
 *
 * For every plural key in the ru/kk catalogs (a base with `_one` / `_few` /
 * `_many` / `_other` / `_zero` variants) this resolves the phrase for a spread
 * of counts and prints the result, so the reviewer can eyeshot that
 * "1 программа / 2 программы / 5 программ / 11 программ" (and the kk
 * equivalents) all read correctly.
 *
 * It also fails (exit 1) when a count resolves to an empty string or to the
 * raw key — i.e. a plural category the catalog doesn't cover.
 *
 * Run: `node scripts/i18n-plurals.mjs`  (or `npm run i18n:plurals`)
 * No network, no build — reads the JSON files directly.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import i18next from 'i18next';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES_DIR = join(ROOT, 'src/shared/i18n/locales');
const LOCALES = ['ru', 'kk'];
const COUNTS = [0, 1, 2, 5, 11, 21, 100];
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function loadNamespace(locale, file) {
  return JSON.parse(readFileSync(join(LOCALES_DIR, locale, file), 'utf8'));
}

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

const files = readdirSync(join(LOCALES_DIR, 'ru')).filter((f) => f.endsWith('.json'));

const resources = {};
for (const locale of LOCALES) {
  resources[locale] = {};
  for (const file of files) resources[locale][file.replace('.json', '')] = loadNamespace(locale, file);
}

let failures = 0;

for (const locale of LOCALES) {
  const inst = i18next.createInstance();
  await inst.init({
    lng: locale,
    fallbackLng: 'ru',
    ns: files.map((f) => f.replace('.json', '')),
    defaultNS: 'common',
    resources,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
  });

  console.log(`\n=== ${locale} ===`);

  for (const file of files) {
    const ns = file.replace('.json', '');
    const flat = flatten(resources[locale][ns], '', {});
    const bases = new Set();
    for (const key of Object.keys(flat)) {
      if (PLURAL_SUFFIX.test(key)) bases.add(key.replace(PLURAL_SUFFIX, ''));
    }
    if (bases.size === 0) continue;

    for (const base of [...bases].sort()) {
      const rendered = COUNTS.map((count) => {
        const out = inst.t(`${ns}:${base}`, { count });
        if (out === '' || out === `${ns}:${base}` || out === base) {
          failures++;
          return `${count}=<MISSING>`;
        }
        return `${count}=«${out}»`;
      });
      console.log(`  ${ns}:${base}`);
      console.log(`    ${rendered.join('  ')}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} plural case(s) resolved to an empty string or the raw key`);
  process.exit(1);
}
console.log('\n✓ every plural key resolves for counts', COUNTS.join(', '));
