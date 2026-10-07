/**
 * PRO-279 — ban Tailwind arbitrary font-size utilities (`text-[14px]`,
 * `text-[0.68rem]`, `text-[clamp(...)]`, `text-[length:…]`) in source.
 *
 * Mirrors the ESLint rule in eslint-rules/no-arbitrary-text-size.js so CI can
 * fail without needing a full ESLint install during quick local checks.
 *
 * Also checks redesign CSS (src/shared/ui/redesign/*.css, landing): font-size
 * there must come from var(--text-*) — see the CSS block at the bottom.
 *
 * Run: `node scripts/no-arbitrary-text-size.mjs`  (or `npm run lint:typography`)
 * Exit 1 on any hit.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const EXT = /\.(?:js|jsx|ts|tsx)$/;
const SIZE_ARBITRARY =
  /(?:^|[\s"'`])((?:[\w-]+(?:\[[^\]]*])?:)*)text-\[([^\]]+)\]/g;

function isFontSizePayload(payload) {
  const p = payload.trim();
  if (p.startsWith('color:') || p.startsWith('url(') || p.startsWith('#')) return false;
  if (p.startsWith('var(') && !p.startsWith('length:')) return false;
  if (p.startsWith('length:')) return true;
  if (/^clamp\(/i.test(p)) return true;
  if (/^\d*\.?\d+(?:px|rem|em|vw|vh|%)$/i.test(p)) return true;
  return false;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

function hitsIn(source) {
  const hits = [];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    SIZE_ARBITRARY.lastIndex = 0;
    let m;
    while ((m = SIZE_ARBITRARY.exec(line)) !== null) {
      if (!isFontSizePayload(m[2])) continue;
      hits.push({ line: i + 1, token: m[0].replace(/^[\s"'`]+/, '') });
    }
  }
  return hits;
}

const files = walk(ROOT);
let problems = 0;

for (const file of files) {
  const hits = hitsIn(readFileSync(file, 'utf8'));
  if (!hits.length) continue;
  const rel = relative(join(ROOT, '..'), file);
  console.log(`\n${rel}`);
  for (const { line, token } of hits) {
    problems += 1;
    console.log(`  L${line}: ${token}`);
  }
}

// ─── CSS редизайна: размер шрифта только из шкалы @theme ─────────────────────
// В JSX размер задают классы, в CSS — объявления font-size / font. Здесь они
// должны ссылаться на var(--text-…) из src/styles/tailwind.css. Графику
// (логотип, глифы-иконки, монограммы) помечают комментарием сразу после
// объявления: `font-size: 38px; /* type-exempt: логотип */`.
const CSS_FILES = [
  ...readdirSync(join(ROOT, 'shared/ui/redesign'))
    .filter((n) => n.endsWith('.css'))
    .map((n) => join(ROOT, 'shared/ui/redesign', n)),
  join(ROOT, 'pages/landing/redesign.css'),
];
const CSS_DECL = /\b(font-size|font)\s*:\s*([^;}]+)([;}])(\s*\/\*\s*type-exempt)?/g;
// Ссылка на несуществующий токен не падает, а молча даёт размер родителя.
// Обычный @theme Tailwind выводит, только если токен нужен его утилитам,
// поэтому CSS может опираться лишь на блок `@theme static`.
const STATIC_THEME = readFileSync(join(ROOT, 'styles/tailwind.css'), 'utf8').match(/@theme static\s*\{[^}]*\}/g) ?? [];
const DEFINED = new Set(STATIC_THEME.flatMap((block) => [...block.matchAll(/(--text-[\w-]+)\s*:/g)].map((m) => m[1])));
const LITERAL_SIZE = /(?:^|[\s(,/])-?\d*\.?\d+(?:px|rem|em|vw|vh|%)/;

let cssProblems = 0;
for (const file of CSS_FILES) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((line, i) => {
    CSS_DECL.lastIndex = 0;
    let m;
    while ((m = CSS_DECL.exec(line)) !== null) {
      for (const v of m[2].matchAll(/var\((--text-[\w-]+)\)/g)) {
        if (!DEFINED.has(v[1])) hits.push({ line: i + 1, token: `${m[1]}: ${m[2].trim()} — ${v[1]} нет в @theme static` });
      }
      if (m[4]) continue;
      const value = m[2].replace(/var\(--[\w-]+\)/g, '');
      if (LITERAL_SIZE.test(value)) hits.push({ line: i + 1, token: `${m[1]}: ${m[2].trim()}` });
    }
  });
  if (!hits.length) continue;
  console.log(`\n${relative(join(ROOT, '..'), file)}`);
  for (const { line, token } of hits) {
    cssProblems += 1;
    console.log(`  L${line}: ${token}`);
  }
}

if (problems > 0) {
  console.error(
    `\n✗ ${problems} arbitrary text-[…] font-size use(s). Use text-display-* / text-body-* / text-caption / text-mono-* or <Heading>/<Text>/<Mono>.`,
  );
}
if (cssProblems > 0) {
  console.error(
    `\n✗ ${cssProblems} font size(s) outside the scale in redesign CSS. Use var(--text-rd-*) from src/styles/tailwind.css.`,
  );
}
if (problems > 0 || cssProblems > 0) process.exit(1);

console.log(`✓ no arbitrary font sizes across ${files.length} source files and ${CSS_FILES.length} redesign stylesheets`);
