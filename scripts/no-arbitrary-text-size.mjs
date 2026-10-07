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

// ─── CSS: размер шрифта из шкалы @theme ───────────────────────────────────────
// В JSX размер задают классы, в CSS — объявления font-size / font.
//
// Redesign-CSS (shared/ui/redesign, лендинг): размер — только var(--text-…) из
// блока `@theme static` в src/styles/tailwind.css. Графику (логотип,
// глифы-иконки, монограммы) помечают комментарием сразу после объявления:
// `font-size: 38px; /* type-exempt: логотип */`.
//
// CSS экранов теста на шкалу ещё не переведён, поэтому там проверяется только
// нижняя граница: числом меньше 12 px нельзя.
const cssIn = (dir) =>
  readdirSync(join(ROOT, dir), { recursive: true })
    .filter((n) => String(n).endsWith('.css'))
    .map((n) => join(ROOT, dir, String(n)));
const SCALE_FILES = [...cssIn('shared/ui/redesign'), join(ROOT, 'pages/landing/redesign.css')];
const FLOOR_FILES = cssIn('pages/assessment');

// Ссылка на несуществующий токен не падает, а молча даёт размер родителя.
// Обычный @theme Tailwind выводит, только если токен нужен его утилитам,
// поэтому CSS может опираться лишь на блок `@theme static`.
function staticThemeBlocks(css) {
  const blocks = [];
  for (const m of css.matchAll(/@theme\s+static\s*\{/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < css.length && depth; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
    blocks.push(css.slice(m.index, i));
  }
  return blocks;
}
const DEFINED = new Set(
  staticThemeBlocks(readFileSync(join(ROOT, 'styles/tailwind.css'), 'utf8')).flatMap((b) =>
    [...b.matchAll(/(--text-[\w-]+)\s*:/g)].map((m) => m[1]),
  ),
);
const LITERAL_SIZE = /(?:^|[\s(,/])(-?\d*\.?\d+)(px|rem|em|vw|vh|%)/g;
// Объявление целиком, даже если оно занимает несколько строк.
const CSS_DECL = /(?<![\w-])(font-size|font)\s*:\s*([^;{}]+?)\s*([;}])(\s*\/\*\s*type-exempt)?/g;

function cssHits(file, mode) {
  const css = readFileSync(file, 'utf8').replace(/\/\*(?!\s*type-exempt)[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const hits = [];
  const lineAt = (offset) => css.slice(0, offset).split('\n').length;
  for (const m of css.matchAll(CSS_DECL)) {
    const [, prop, value, , exempt] = m;
    const at = { line: lineAt(m.index), token: `${prop}: ${value.replace(/\s+/g, ' ')}` };
    if (mode === 'floor') {
      for (const [, n, unit] of value.matchAll(LITERAL_SIZE)) {
        const px = unit === 'px' ? Number(n) : unit === 'rem' ? Number(n) * 16 : null;
        if (px !== null && px < 12) hits.push({ ...at, token: `${at.token} — меньше 12 px` });
      }
      continue;
    }
    for (const [, name] of value.matchAll(/var\((--[\w-]+)/g)) {
      if (!name.startsWith('--text-')) hits.push({ ...at, token: `${at.token} — ${name} не из шкалы --text-*` });
      else if (!DEFINED.has(name)) hits.push({ ...at, token: `${at.token} — ${name} нет в @theme static` });
    }
    if (exempt) continue;
    if ([...value.replace(/var\([^)]*\)/g, '').matchAll(LITERAL_SIZE)].length) hits.push(at);
  }
  return hits;
}

let cssProblems = 0;
for (const [files, mode] of [[SCALE_FILES, 'scale'], [FLOOR_FILES, 'floor']]) {
  for (const file of files) {
    const hits = cssHits(file, mode);
    if (!hits.length) continue;
    console.log(`\n${relative(join(ROOT, '..'), file)}`);
    for (const { line, token } of hits) {
      cssProblems += 1;
      console.log(`  L${line}: ${token}`);
    }
  }
}

if (problems > 0) {
  console.error(
    `\n✗ ${problems} arbitrary text-[…] font-size use(s). Use text-display-* / text-body-* / text-caption / text-mono-* or <Heading>/<Text>/<Mono>.`,
  );
}
if (cssProblems > 0) {
  console.error(
    `\n✗ ${cssProblems} font size problem(s) in CSS. Redesign CSS: use var(--text-rd-*) from src/styles/tailwind.css; nothing below 12px anywhere.`,
  );
}
if (problems > 0 || cssProblems > 0) process.exit(1);

console.log(`✓ no arbitrary font sizes across ${files.length} source files, ${SCALE_FILES.length} redesign and ${FLOOR_FILES.length} assessment stylesheets`);
