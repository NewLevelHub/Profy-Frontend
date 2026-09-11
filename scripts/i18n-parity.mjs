/**
 * KZ-211 — key parity between ru and kk catalogs.
 *
 * Every key in `locales/ru/<ns>.json` must exist in `locales/kk/<ns>.json`
 * and vice-versa. Plural variants (`_one` / `_few` / `_many` / `_other` /
 * `_zero`) collapse to their base before comparison, since ru and kk have
 * different plural-category sets by design (checked separately by
 * `i18n-plurals.mjs`).
 *
 * Run: `node scripts/i18n-parity.mjs`  (or `npm run i18n:parity`)
 * Exit 1 on any missing/extra key. Wired into CI by KZ-602.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/shared/i18n/locales');
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key.replace(PLURAL_SUFFIX, ''));
  }
  return out;
}

const files = readdirSync(join(LOCALES_DIR, 'ru')).filter((f) => f.endsWith('.json'));
let problems = 0;
let totalKeys = 0;

for (const file of files) {
  const ru = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, 'ru', file), 'utf8')), '', new Set());
  const kk = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, 'kk', file), 'utf8')), '', new Set());
  totalKeys += ru.size;

  const missing = [...ru].filter((k) => !kk.has(k)).sort();
  const extra = [...kk].filter((k) => !ru.has(k)).sort();

  if (missing.length || extra.length) {
    problems += missing.length + extra.length;
    console.log(`\n${file}`);
    missing.forEach((k) => console.log(`  missing in kk: ${k}`));
    extra.forEach((k) => console.log(`  extra in kk:   ${k}`));
  } else {
    console.log(`${file.padEnd(18)} ${ru.size} keys — ok`);
  }
}

if (problems > 0) {
  console.error(`\n✗ ${problems} key parity problem(s)`);
  process.exit(1);
}
console.log(`\n✓ ru ↔ kk parity across ${files.length} namespaces (${totalKeys} keys)`);
