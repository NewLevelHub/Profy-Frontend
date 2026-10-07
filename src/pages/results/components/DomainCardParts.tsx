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
      className="rd-domain-card panel-glass p-5 sm:p-7 flex flex-col gap-6"
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

export function DomainKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="journey-kicker mb-2">
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
        'rd-domain-grid grid gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden',
        columnsClassName,
      )}
    >
      {children}
    </div>
  );
}

/** Centered grid cell — for short, enumerable items (interest types,
 * personality traits).
 *
 * `level` and `selected` only land in data attributes: fill, text and icon
 * colors per level live in the report stylesheet (`.rd-report .rd-domain-cell`
 * in `shared/ui/redesign/student.css`). No inline colors here — the
 * stylesheet couldn't override them without !important. */
export function DomainCell({
  icon,
  title,
  status,
  description,
  level,
  selected = false,
  onSelect,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  status?: string;
  description?: string;
  level?: InterestLevel;
  /** Makes the cell a toggle button that opens a detail panel elsewhere. */
  onSelect?: () => void;
  selected?: boolean;
  /** Extra content under the description (e.g. a level meter). */
  children?: React.ReactNode;
}) {
  const isLow = level === 'low';
  const Tag = onSelect ? 'button' : 'div';
  // <p> isn't valid inside <button> — same look, phrasing element instead.
  const TextTag = onSelect ? 'span' : 'p';
  return (
    <Tag
      data-level={level}
      data-selected={selected}
      type={onSelect ? 'button' : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onClick={onSelect}
      className={cn(
        'rd-domain-cell p-3 sm:p-4 flex flex-col items-center text-center gap-1.5 transition-[opacity,box-shadow]',
        onSelect && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[color:var(--dawn-deep)]',
      )}
    >
      {icon}
      <TextTag className="block text-body-sm font-semibold leading-snug line-clamp-2">
        {title}
      </TextTag>
      {status && (
        <TextTag
          className={cn('block font-mono uppercase tracking-label', isLow ? 'text-tiny' : 'text-mono-xs')}
        >
          {status}
        </TextTag>
      )}
      {description && (
        <TextTag className="block text-caption leading-snug">
          {description}
        </TextTag>
      )}
      {children}
    </Tag>
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
  descriptionLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  descriptionLabel?: string;
}) {
  return (
    <div className="rd-domain-list-card border border-[var(--hairline)] rounded-[var(--radius)] bg-surface p-4 sm:p-5 flex items-start gap-3">
      {icon}
      <div className="min-w-0">
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug">{title}</p>
        {description && (
          <p className="text-caption leading-snug mt-1" style={{ color: 'var(--ink)' }}>
            {descriptionLabel && (
              <span className="font-semibold text-[color:var(--text-heading)]">{descriptionLabel} </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
