import { cn } from '@/shared/lib/cn';

/**
 * Shared visual vocabulary for every "domain" section at the top of the
 * results page (interests, personality, strengths, thinking style,
 * motivation) — one place owning the card frame, kicker, grid, and cell
 * typography so all of them stay pixel-identical by construction instead of
 * by convention. Originated in InterestDomainSection; extracted once a
 * second/third/fourth/fifth section needed the exact same look.
 */

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

/** Centered grid cell — for short, enumerable items (interest types,
 * personality traits, strengths, thinking-style notes). */
export function DomainCell({
  icon,
  title,
  status,
  statusColor,
  description,
  isLeading,
}: {
  icon?: React.ReactNode;
  title: string;
  status?: string;
  statusColor?: string;
  description?: string;
  isLeading?: boolean;
}) {
  return (
    <div
      className="p-3 sm:p-4 flex flex-col items-center text-center gap-1.5"
      style={{ background: isLeading ? 'color-mix(in srgb, var(--pine) 6%, var(--bg-surface))' : 'var(--bg-surface)' }}
    >
      {icon}
      <p className="text-body-sm font-semibold text-[color:var(--midnight)] leading-snug line-clamp-2">
        {title}
      </p>
      {status && (
        <p
          className="font-mono text-mono-xs uppercase tracking-label"
          style={{ color: statusColor ?? 'var(--ink)' }}
        >
          {status}
        </p>
      )}
      {description && (
        <p className="text-caption leading-snug" style={{ color: 'var(--ink)' }}>
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
