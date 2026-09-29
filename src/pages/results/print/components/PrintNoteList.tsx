interface PrintNote {
  title: string;
  description?: string;
  /** Short label printed above the title (e.g. what a strength is grounded in). */
  tag?: string | null;
  /** One extra line under the description, prefixed with `noteLabel`. */
  note?: string | null;
}

interface PrintNoteListProps {
  items: PrintNote[];
  /** Shown instead of the list when there is nothing to print. */
  emptyText?: string;
  noteLabel?: string;
}

/**
 * Title + description rows (strengths, thinking style). No icons: the
 * on-screen icons for these are decoration or a restatement of the tag, and
 * decoration that survives into a PDF only costs ink.
 */
export function PrintNoteList({ items, emptyText, noteLabel }: PrintNoteListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-caption text-muted">{emptyText}</p> : null;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="print-block border-l-2 border-[var(--hairline)] pl-3">
          {item.tag && (
            <p className="font-mono text-mono-xs uppercase tracking-label text-muted leading-tight mb-0.5">
              {item.tag}
            </p>
          )}
          <p className="text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug">
            {item.title}
          </p>
          {item.description && (
            <p className="text-caption leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>
              {item.description}
            </p>
          )}
          {item.note && (
            <p className="text-caption leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>
              {noteLabel && <span className="font-semibold">{noteLabel} </span>}
              {item.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
