import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Mono } from '@/shared/ui/typography/Mono';

export interface RuledGridProps {
  /** Caller supplies its own display/grid-cols (e.g. "grid grid-cols-3" or "flex flex-wrap") */
  className?: string;
  children: ReactNode;
}

// Soft field tiles with air between them — replaces the old beige hairline
// table (1px gap + solid surface cells) that read as flat paperwork on the
// new mesh background.
export function RuledGrid({ className, children }: RuledGridProps) {
  return (
    <div className={cn('gap-2.5', className)}>
      {children}
    </div>
  );
}

export interface RuledCellProps {
  label: string;
  value: ReactNode;
}

export function RuledCell({ label, value }: RuledCellProps) {
  return (
    <div className="field-tile px-4 py-3.5">
      <p className="text-caption text-secondary">{label}</p>
      <p className="text-body-md font-semibold text-[color:var(--text-heading)] mt-0.5">{value}</p>
    </div>
  );
}

export interface RuledStatProps {
  label: string;
  value: string | number | null;
}

// Missing score reads as a muted em dash rather than being omitted — the
// column stays put so students see which scores they haven't added yet.
export function RuledStat({ label, value }: RuledStatProps) {
  const hasValue = value !== null;
  return (
    <div className="field-tile px-4 py-3.5 flex-1 min-w-[92px]">
      <Mono variant="xs" as="p" className="text-secondary">{label}</Mono>
      <Mono
        variant="md"
        as="p"
        className={cn('font-semibold mt-1', hasValue ? 'text-[color:var(--lake)]' : 'text-subtle')}
      >
        {hasValue ? value : '—'}
      </Mono>
    </div>
  );
}
