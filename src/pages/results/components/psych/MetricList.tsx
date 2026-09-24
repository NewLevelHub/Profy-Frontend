import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface MetricRowData {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

/**
 * Hairline-divided row list for dense numeric breakdowns (validity
 * "Расшифровка", psychoemotional indices/structural indices) — same visual
 * trick as `DomainGrid` (RIASEC/BigFive domain cards): the container's
 * `var(--hairline)` background shows through the 1px `gap-px` as row
 * dividers, cells sit on `bg-surface`. Plain stacked `<p>` lines read as
 * running text and blur together at this density; this reads as a table
 * without introducing a new visual language.
 */
export function MetricList({ rows, className }: { rows: MetricRowData[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden',
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-start justify-between gap-4 bg-surface px-3 py-2 text-caption"
        >
          <span className="text-secondary">{row.label}</span>
          <span className="shrink-0 text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
