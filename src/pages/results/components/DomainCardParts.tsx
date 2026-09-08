import { cn } from '@/shared/lib/cn';
import type { InterestLevel } from '@/shared/types';

/**
 * Shared visual vocabulary for every "domain" section at the top of the
 * results page (interests, personality, strengths, thinking style,
 * motivation) — one place owning the card frame, kicker, grid, and cell
 * typography so all of them stay pixel-identical by construction instead of
 * by convention. Originated in InterestDomainSection; extracted once a
 * second/third/fourth/fifth section needed the exact same look.
 */

// i18n key for the status word under a level-ranked cell (design spec §06 —
// "fill contrast" variant) — shared by every section keyed on the same opaque
// low/medium/high enum (interest_map, personality_notes). `high`'s wording is
// domain-specific ("ВЕДУЩИЙ" for a type, "СИЛЬНАЯ СТОРОНА" for a trait) —
// callers spread this and override just that key, then resolve with `t()`.
export const LEVEL_STATUS_LABEL: Record<InterestLevel, string> = {
  high: 'results:domain.statusHigh',
  medium: 'results:domain.statusMedium',
  low: 'results:domain.statusLow',
};

export function DomainCardFrame({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border border-strong rounded-[var(--radius)] bg-page p-5 sm:p-6 flex flex-col gap-6"
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

export function DomainKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted mb-2">
      {children}
    </p>
  );
}

export function DomainEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[var(--hairline)] rounded-[var(--radius)] bg-surface p-4">
      <p className="text-caption text-muted">{children}</p>
    </div>
  );
}

/** Hairline-bordered grid — cells provide their own `bg-surface`, the gap
 * shows through as a 1px hairline between them. */
export function DomainGrid({
  columnsClassName,
  children,
}: {
  columnsClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden',
        columnsClassName,
      )}
    >
      {children}
    </div>
  );
}

// Fill color per level — high is Pine (green, structure/success), medium is
// Dawn (orange, the interface's "finding" accent), low has no fill at all.
const LEVEL_FILL: Record<InterestLevel, string | undefined> = {
  high: 'var(--pine)',
  medium: 'var(--dawn)',
  low: undefined,
};

/** Centered grid cell — for short, enumerable items (interest types,
 * personality traits, strengths, thinking-style notes).
 *
 * "Fill contrast" variant: when `level` is given, it — not the caller — owns
 * background/text/icon color. Borders stay the grid's plain hairline in all
 * three cases, only the fill changes:
 *   low    — background goes transparent (page shows through), whole cell
 *            dims to ~45% so it visibly recedes.
 *   medium — fills solid Dawn; text/icon flip to --text-on-brand.
 *   high   — fills solid Pine; text/icon flip to --text-on-brand.
 * Cells with no `level` (strengths, thinking-style) render exactly as
 * before — plain surface, ink text, no dimming. */
export function DomainCell({
  icon,
  title,
  status,
  description,
  level,
}: {
  icon?: React.ReactNode;
  title: string;
  status?: string;
  description?: string;
  level?: InterestLevel;
}) {
  const fill = level ? LEVEL_FILL[level] : undefined;
  const isFilled = fill !== undefined;
  const isLow = level === 'low';
  const fg = isFilled ? 'var(--text-on-brand)' : 'var(--midnight)';
  const descFg = isFilled ? 'var(--text-on-brand)' : 'var(--ink)';
  const statusFg = isFilled ? 'var(--text-on-brand)' : 'var(--text-muted)';
  return (
    <div
      className={cn('p-3 sm:p-4 flex flex-col items-center text-center gap-1.5 transition-colors', isLow && 'opacity-45')}
      style={{ background: fill ?? (isLow ? 'transparent' : 'var(--bg-surface)') }}
    >
      {icon}
      <p className="text-body-sm font-semibold leading-snug line-clamp-2" style={{ color: fg }}>
        {title}
      </p>
      {status && (
        <p
          className={cn('font-mono uppercase tracking-label', isLow ? 'text-tiny' : 'text-mono-xs')}
          style={{ color: statusFg }}
        >
          {status}
        </p>
      )}
      {description && (
        <p className="text-caption leading-snug" style={{ color: descFg }}>
          {description}
        </p>
      )}
    </div>
  );
}

/** Standalone bordered card, one per row — for content that reads better as
 * a stacked list than a grid (longer descriptions, or just a handful of
 * items where a grid would leave awkward empty cells). Same title/
 * description typography as `DomainCell`, just left-aligned and full-width
 * instead of centered in a column. */
export function DomainListCard({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="border border-[var(--hairline)] rounded-[var(--radius)] bg-surface p-4 sm:p-5 flex items-start gap-3">
      {icon}
      <div className="min-w-0">
        <p className="text-body-sm font-semibold text-[color:var(--midnight)] leading-snug">{title}</p>
        {description && (
          <p className="text-caption leading-snug mt-1" style={{ color: 'var(--ink)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
