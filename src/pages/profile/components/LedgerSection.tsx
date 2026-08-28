import type { ReactNode } from 'react';
import { Mono } from '@/shared/ui/typography/Mono';

export interface LedgerSectionProps {
  id: string;
  number: string;
  title: string;
  editLabel?: string;
  editAriaLabel?: string;
  onEdit?: () => void;
  children: ReactNode;
}

// One numbered ledger row: a label+edit-action column (168px, left of the
// content on lg+; stacked above it below that) followed by free-form section
// content. Every profile section in the reference shares this exact shell,
// factored out once instead of five near-identical wrappers.
export function LedgerSection({ id, number, title, editLabel, editAriaLabel, onEdit, children }: LedgerSectionProps) {
  return (
    <section
      id={id}
      className="grid grid-cols-1 lg:grid-cols-[168px_1fr] gap-3 lg:gap-8 px-5 py-6 sm:px-8 border-b border-default last:border-b-0 scroll-mt-4"
    >
      <div className="flex flex-row items-center justify-between lg:flex-col lg:items-start lg:gap-2">
        <Mono variant="xs" className="text-secondary">{number} · {title}</Mono>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-body-sm font-bold text-brand hover:opacity-75 transition-opacity"
            aria-label={editAriaLabel ?? editLabel}
          >
            {editLabel}
          </button>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
