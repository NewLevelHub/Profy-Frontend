interface PrintNote {
  title: string;
  description?: string;
}

interface PrintNoteListProps {
  items: PrintNote[];
  /** Shown instead of the list when there is nothing to print. */
  emptyText?: string;
}

/**
 * Title + description rows (strengths, thinking style). No icons: the
 * on-screen icons for these are explicitly decorative (STRENGTH_ICONS
 * cycles for variety, it carries no meaning), and decoration that survives
 * into a PDF only costs ink.
 */
export function PrintNoteList({ items, emptyText }: PrintNoteListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-caption text-muted">{emptyText}</p> : null;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="print-block border-l-2 border-[var(--hairline)] pl-3">
          <p className="text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug">
            {item.title}
          </p>
          {item.description && (
            <p className="text-caption leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
