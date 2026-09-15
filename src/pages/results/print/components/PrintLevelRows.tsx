import type { InterestLevel } from '@/shared/types';

export interface PrintLevelRow {
  id: string;
  title: string;
  /** Domain-specific status word — "ВЕДУЩИЙ" / "СИЛЬНАЯ СТОРОНА" / … */
  status: string;
  description?: string;
  level: InterestLevel;
}

/*
 * Level is carried by a colored rule + the spelled-out status word, NOT by
 * the screen's solid pine/dawn cell fill. Two reasons, both print-specific:
 * browsers drop background fills unless the reader ticks "Background
 * graphics" (white-on-pine status text would then vanish into the page,
 * and print-color-adjust is not worth betting a printed document on),
 * while borders always print. And a line-not-fill hierarchy is the house
 * rule anyway (DESIGN.md, "Elevation: density and line, not blur"). Color
 * here only reinforces the word — it never carries the meaning alone.
 */
const LEVEL_RULE: Record<InterestLevel, string> = {
  high: 'var(--pine)',
  medium: 'var(--dawn)',
  low: 'var(--hairline)',
};

/**
 * Level-ranked rows — the print counterpart of DomainGrid/DomainCell. A
 * six-across grid of centered cells is a screen layout: on A4 it either
 * shrinks the descriptions past readability or clips them (the screen cells
 * `line-clamp-2`, which in a PDF would silently drop text the reader has no
 * way to expand). One row per item keeps every description whole.
 */
export function PrintLevelRows({ rows }: { rows: PrintLevelRow[] }) {
  if (rows.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {rows.map((row) => {
        const isLow = row.level === 'low';
        return (
          <li
            key={row.id}
            className="print-block flex items-baseline gap-3 border-l-[3px] pl-3 py-1"
            style={{ borderLeftColor: LEVEL_RULE[row.level] }}
          >
            <span
              className="flex-shrink-0 w-[136px] font-mono text-tiny font-bold uppercase tracking-label leading-tight"
              style={{ color: isLow ? 'var(--text-muted)' : 'var(--text-heading)' }}
            >
              {row.status}
            </span>
            <div className="min-w-0">
              <p
                className="text-body-sm font-semibold leading-snug"
                style={{ color: isLow ? 'var(--text-secondary)' : 'var(--text-heading)' }}
              >
                {row.title}
              </p>
              {row.description && (
                <p className="text-caption leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>
                  {row.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
