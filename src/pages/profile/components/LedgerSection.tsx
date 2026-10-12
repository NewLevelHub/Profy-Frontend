import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

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
// content. Soft divider — not a heavy beige rule across the panel.
export function LedgerSection({ id, number, title, editLabel, editAriaLabel, onEdit, children }: LedgerSectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className="rd-profile-section"
    >
      <div className="rd-profile-section-heading">
        <h2>
          <span aria-hidden="true">{number}</span>
          {title}
        </h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-body-sm font-semibold text-brand hover:opacity-75 transition-opacity"
            aria-label={editAriaLabel ?? editLabel}
          >
            <Pencil size={13} aria-hidden="true" />{editLabel}
          </button>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
