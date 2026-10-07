/**
 * PRO-279 — ban Tailwind arbitrary font-size utilities (`text-[14px]`,
 * `text-[0.68rem]`, `text-[clamp(...)]`, `text-[length:…]`) in source.
 *
 * Mirrors the ESLint rule in eslint-rules/no-arbitrary-text-size.js so CI can
 * fail without needing a full ESLint install during quick local checks.
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

if (problems > 0) {
  console.error(
    `\n✗ ${problems} arbitrary text-[…] font-size use(s). Use text-display-* / text-body-* / text-caption / text-mono-* or <Heading>/<Text>/<Mono>.`,
  );
  process.exit(1);
}

console.log(`✓ no arbitrary text-[…] font sizes across ${files.length} files`);
