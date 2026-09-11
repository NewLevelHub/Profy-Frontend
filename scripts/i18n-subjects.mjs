/**
 * KZ-503 — the school-subject list must stay in sync with the backend.
 *
 * The canonical Russian subject string (`SUBJECT_OPTIONS[].value` in
 * ProfileSetupPage.tsx) is what the profile stores and sends to the API; the
 * backend resolves it to a display name via `app/i18n/catalog/subjects.py`
 * (`school_subjects`, same keys). This check pins the frontend half:
 *   - every option `value` is one of the frozen canonical strings;
 *   - every option `key` resolves in both ru and kk `onboarding.json`;
 *   - the ru display string equals the canonical `value`.
 *
 * Run: `node scripts/i18n-subjects.mjs`  (wired into `npm run i18n:check`).
 * Exit 1 on any drift. Keep `CANONICAL` identical to `_CANONICAL_SUBJECTS`
 * in `profi-backend/tests/unit/test_subjects_catalog.py`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CANONICAL = new Set([
  'Математика', 'Физика', 'Химия', 'Биология', 'История', 'География',
  'Русский язык', 'Литература', 'Английский язык', 'Информатика',
  'Физкультура', 'Рисование', 'Музыка',
]);

const src = readFileSync(join(ROOT, 'src/pages/onboarding/ProfileSetupPage.tsx'), 'utf8');
const block = src.match(/const SUBJECT_OPTIONS\s*=\s*\[([\s\S]*?)\]\s*as const;/);
if (!block) {
  console.error('✗ could not find SUBJECT_OPTIONS in ProfileSetupPage.tsx');
  process.exit(1);
}

const options = [...block[1].matchAll(/\{\s*value:\s*'([^']+)',\s*key:\s*'([^']+)'\s*\}/g)]
  .map((m) => ({ value: m[1], key: m[2] }));

const ru = JSON.parse(readFileSync(join(ROOT, 'src/shared/i18n/locales/ru/onboarding.json'), 'utf8')).subject ?? {};
const kk = JSON.parse(readFileSync(join(ROOT, 'src/shared/i18n/locales/kk/onboarding.json'), 'utf8')).subject ?? {};

let problems = 0;
const fail = (msg) => { console.error(`  ✗ ${msg}`); problems++; };

const seen = new Set();
for (const { value, key } of options) {
  seen.add(value);
  if (!CANONICAL.has(value)) fail(`SUBJECT_OPTIONS value not in canonical set: "${value}"`);
  const code = key.startsWith('subject.') ? key.slice('subject.'.length) : null;
  if (!code) { fail(`option key is not "subject.<code>": "${key}"`); continue; }
  if (!(code in ru)) fail(`missing ru onboarding.json subject.${code}`);
  if (!(code in kk)) fail(`missing kk onboarding.json subject.${code}`);
  if (code in ru && ru[code] !== value) {
    fail(`ru subject.${code} = "${ru[code]}" but canonical value is "${value}"`);
  }
}
for (const value of CANONICAL) {
  if (!seen.has(value)) fail(`canonical subject missing from SUBJECT_OPTIONS: "${value}"`);
}

if (problems) {
  console.error(`\n✗ ${problems} school-subject sync problem(s) — see profi-backend app/i18n/catalog/subjects.py`);
  process.exit(1);
}
console.log(`✓ ${options.length} school subjects in sync (SUBJECT_OPTIONS ↔ onboarding.json ru/kk)`);
