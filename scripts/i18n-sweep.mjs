/**
 * KZ-211 — full-tree sweep for unlocalized user-facing Cyrillic.
 *
 * Walks every `src/**` .ts/.tsx file, strips block/line comments, and reports
 * any remaining Cyrillic. Paths in `scripts/i18n-exclude.json` (admin + the
 * documented per-file carve-outs) and the locale JSON themselves are skipped.
 *
 * `ALLOW` below whitelists the known, reviewed backend-data-matching literals
 * (KZ-206) — comparisons/parsers against ru-only API data, not UI copy. Every
 * one is anchored to a comment in its source file.
 *
 * Run: `node scripts/i18n-sweep.mjs`  (or `npm run i18n:sweep`)
 * Exit 1 if anything unexpected is found.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const CYR = /[А-Яа-яЁё]/;

const exclude = JSON.parse(readFileSync(join(ROOT, 'scripts/i18n-exclude.json'), 'utf8'));
const EXCLUDE_PREFIXES = [
  'src/shared/i18n/locales/',
  ...exclude.globs.map((g) => g.replace('/**', '/')),
  ...exclude.globs.filter((g) => !g.includes('*')),
  ...exclude.files.map((f) => f.path),
];

// Reviewed literals that are NOT UI copy — each anchored to a comment in its
// source file. Structure: [relPath, lineRegex, reason].
const ALLOW = [
  // KZ-206 — Cyrillic used to match/parse ru-only backend data, never shown.
  ['src/pages/results/utils/programUtils.ts', /Казахстан|Қазақстан|тенге|евро|фунт|юан|вон|крон|рупи|франк|иен|йен|рэнд|ранд|реал|доллар|А-ЯA-Z/, 'backend-data matcher/parser'],
  ['src/pages/results/ProgramDetailPage.tsx', /Казахстан|Общий конкурс|проходной балл/, 'backend admission-score parser'],
  ['src/pages/results/hooks/useUniversityList.ts', /Казахстан/, 'backend country value match'],
  // KZ-204 — canonical option values sent to the API as-is, displayed via t().
  ['src/pages/onboarding/ProfileSetupPage.tsx', /value: '[^']+'/, 'canonical subject value (display via t(s.key))'],
  ['src/pages/onboarding/ArtifactsSetupPage.tsx', /^("?[^']*"?\s*)?('[^']*'\s*,?\s*)+$/, 'canonical preset value (display via presetLabel/t)'],
  // Language picker shows each option in its own script (KZ-105).
  ['src/shared/ui/LanguageSwitcher.tsx', /'ҚАЗ'/, 'language-picker self-label'],
  // Dev-only affordance behind import.meta.env.DEV — stripped from prod build.
  ['src/shared/ui/navigation/AssessmentRail.tsx', /Автозаполнить/, 'dev-only autofill (import.meta.env.DEV)'],
  // KZ-502 — ru→kk dictionary for catalog city/country strings (backend data).
  // Both sides are Cyrillic by nature; keys match backend values, values are
  // the localized output. Native review: KZ-502-вычитка-kk.md.
  ['src/shared/i18n/geo.ts', /^'[^']+':\s*'[^']+',$/, 'ru→kk geo dictionary (KZ-502)'],
  // Canonical ru subject label → onboarding `subject.<key>` map; the ru side is
  // the stored profile value, output is localized via t('onboarding:subject.*').
  ['src/shared/i18n/presets.ts', /^'[^']+':\s*'[a-z]+',$/, 'ru subject label → catalog key'],
];

function isExcluded(rel) {
  return EXCLUDE_PREFIXES.some((p) => rel === p || rel.startsWith(p));
}
function isAllowed(rel, line) {
  return ALLOW.some(([f, re]) => rel === f && re.test(line.trim()));
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

let findings = 0;
let allowed = 0;
for (const file of walk(SRC, [])) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (isExcluded(rel)) continue;
  let src = readFileSync(file, 'utf8');
  src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  src.split('\n').forEach((line, idx) => {
    const code = line.replace(/\/\/.*/, '');
    if (!CYR.test(code)) return;
    if (isAllowed(rel, line)) { allowed++; return; }
    findings++;
    console.log(`${rel}:${idx + 1}: ${line.trim().slice(0, 140)}`);
  });
}

console.log(`\n${allowed} allowed backend-data literal(s) skipped`);
if (findings > 0) {
  console.error(`✗ ${findings} unlocalized Cyrillic line(s) outside the catalog`);
  process.exit(1);
}
console.log('✓ no unlocalized user-facing Cyrillic outside the catalog');
