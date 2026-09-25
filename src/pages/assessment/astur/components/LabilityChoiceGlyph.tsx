import type { AsturLabilityAnswerFormat } from '@/shared/types';

type Glyph =
  | { kind: 'circle' }
  | { kind: 'square' }
  | { kind: 'plus' }
  | { kind: 'minus' }
  | { kind: 'check' }
  | { kind: 'cross' }
  | { kind: 'digit'; text: string }
  | { kind: 'word'; text: string };

/** Map localized option strings (ru + kk from the bank) onto a visual glyph.
 *  Unknown values fall back to the raw text so a future bank edit never blanks
 *  the button. */
export function resolveLabilityGlyph(option: string, format: AsturLabilityAnswerFormat): Glyph {
  const key = option.trim().toLowerCase();

  if (key === 'кружок' || key === 'шеңбер') return { kind: 'circle' };
  if (key === 'квадрат' || key === 'шаршы') return { kind: 'square' };
  if (key === 'плюс' || key === 'қосу') return { kind: 'plus' };
  if (key === 'минус' || key === 'азайту') return { kind: 'minus' };
  if (key === 'галочка' || key === 'құстырма') return { kind: 'check' };
  if (key === 'крестик' || key === 'айқас') return { kind: 'cross' };

  if (format === 'digit' || /^\d+$/.test(option.trim())) {
    return { kind: 'digit', text: option.trim() };
  }

  return { kind: 'word', text: option };
}

const stroke = 'currentColor';

export function LabilityChoiceGlyph({ glyph }: { glyph: Glyph }) {
  switch (glyph.kind) {
    case 'circle':
      return (
        <span
          aria-hidden
          className="block h-14 w-14 rounded-full border-[3px]"
          style={{ borderColor: stroke }}
        />
      );
    case 'square':
      return (
        <span
          aria-hidden
          className="block h-14 w-14 rounded-[6px] border-[3px]"
          style={{ borderColor: stroke }}
        />
      );
    case 'plus':
      return (
        <svg aria-hidden viewBox="0 0 56 56" className="h-14 w-14" fill="none">
          <path d="M28 10v36M10 28h36" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'minus':
      return (
        <svg aria-hidden viewBox="0 0 56 56" className="h-14 w-14" fill="none">
          <path d="M12 28h32" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'check':
      return (
        <svg aria-hidden viewBox="0 0 56 56" className="h-14 w-14" fill="none">
          <path
            d="M12 29l12 12 20-24"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'cross':
      return (
        <svg aria-hidden viewBox="0 0 56 56" className="h-14 w-14" fill="none">
          <path d="M16 16l24 24M40 16L16 40" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'digit':
      return (
        <span aria-hidden className="font-mono text-display-lg font-bold leading-none tracking-tight">
          {glyph.text}
        </span>
      );
    case 'word':
      return (
        <span aria-hidden className="text-display-sm font-extrabold leading-none capitalize">
          {glyph.text}
        </span>
      );
  }
}
