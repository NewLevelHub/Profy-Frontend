/**
 * Ban Tailwind arbitrary font-size utilities in className strings.
 *
 * Forbidden: text-[14px], text-[0.68rem], text-[clamp(...)], text-[length:…],
 *            and the same with variants (md:, max-[680px]:, hover:, …).
 * Allowed:   text-[color:…], text-[#hex], text-[var(--…)] when clearly color,
 *            and non-text utilities like gap-[…] / tracking-[…].
 *
 * Prefer text-display-* / text-body-* / text-caption / text-mono-* or
 * <Heading>/<Text>/<Mono>. See .cursor/rules/typography.mdc.
 */

/** Full token including optional variant prefixes. */
const SIZE_ARBITRARY =
  /(?:^|[\s"'`])((?:[\w-]+(?:\[[^\]]*])?:)*)text-\[([^\]]+)\]/g;

/** Payload inside text-[…] that sets font-size. */
function isFontSizePayload(payload) {
  const p = payload.trim();
  if (p.startsWith('color:') || p.startsWith('url(') || p.startsWith('#')) return false;
  if (p.startsWith('var(') && !p.startsWith('length:')) return false;
  if (p.startsWith('length:')) return true;
  if (/^clamp\(/i.test(p)) return true;
  // bare length: 14px, 0.68rem, .8rem, 1.2em, 3vw, 50%
  if (/^\d*\.?\d+(?:px|rem|em|vw|vh|%)$/i.test(p)) return true;
  return false;
}

/**
 * @param {string} value
 * @param {(match: string, index: number) => void} onHit
 */
function scan(value, onHit) {
  SIZE_ARBITRARY.lastIndex = 0;
  let m;
  while ((m = SIZE_ARBITRARY.exec(value)) !== null) {
    const payload = m[2];
    if (!isFontSizePayload(payload)) continue;
    const full = m[0].replace(/^[\s"'`]+/, '');
    const start = m.index + (m[0].length - full.length);
    onHit(full, start);
  }
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow arbitrary Tailwind text-[…] font sizes; use role tokens instead',
    },
    schema: [],
    messages: {
      forbidden:
        'Avoid arbitrary font size "{{value}}". Use text-display-* / text-body-* / text-caption / text-mono-* or <Heading>/<Text>/<Mono>.',
    },
  },
  create(context) {
    const report = (node, value, offset) => {
      context.report({
        node,
        messageId: 'forbidden',
        data: { value },
        loc:
          node.loc && offset != null
            ? {
                start: {
                  line: node.loc.start.line,
                  column: node.loc.start.column + offset,
                },
                end: {
                  line: node.loc.start.line,
                  column: node.loc.start.column + offset + value.length,
                },
              }
            : undefined,
      });
    };

    const checkLiteral = (node) => {
      if (typeof node.value !== 'string') return;
      scan(node.value, (match, index) => report(node, match, index + 1));
    };

    const checkTemplate = (node) => {
      for (const quasi of node.quasis) {
        scan(quasi.value.cooked ?? quasi.value.raw, (match, index) =>
          report(quasi, match, index + 1),
        );
      }
    };

    return {
      Literal: checkLiteral,
      TemplateLiteral: checkTemplate,
      JSXAttribute(node) {
        if (node.name.name !== 'className' && node.name.name !== 'class') return;
        if (!node.value) return;
        if (node.value.type === 'Literal') checkLiteral(node.value);
        if (node.value.type === 'JSXExpressionContainer') {
          const expr = node.value.expression;
          if (expr.type === 'Literal') checkLiteral(expr);
          if (expr.type === 'TemplateLiteral') checkTemplate(expr);
        }
      },
    };
  },
};

export default rule;
