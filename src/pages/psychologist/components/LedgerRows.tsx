import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { typeClass } from '@/shared/ui/typography';

export interface LedgerRow {
  label: ReactNode;
  value: ReactNode;
  /** Colour of the value — the figure is what's being read. */
  tone?: 'default' | 'pine' | 'dawn';
}

/** Label … value lines with a dotted rule between them — the queue stats and
 *  the publish summary. */
export function LedgerRows({ rows, className }: { rows: LedgerRow[]; className?: string }) {
  return (
    <dl className={cn('grid gap-2 m-0', className)}>
      {rows.map((row, index) => (
        <div
          key={index}
          className={cn(
            'flex items-baseline justify-between gap-6',
            index < rows.length - 1 && 'pb-1.5 border-b border-dotted border-strong',
          )}
        >
          <dt className={cn(typeClass.caption, 'text-muted')}>{row.label}</dt>
          <dd
            className={cn(
              typeClass.monoMd,
              'm-0 tabular-nums',
              row.tone === 'pine' && 'text-[color:var(--pine)]',
              row.tone === 'dawn' && 'text-[color:var(--dawn-deep)]',
              (!row.tone || row.tone === 'default') && 'text-heading',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
