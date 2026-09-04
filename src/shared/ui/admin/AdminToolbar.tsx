import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CONTROL, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * One filter bar for every admin list.
 *
 * Before PRO-242 there were four different filtering interactions across seven
 * lists: a manual "+EMAIL → input → OK" chip flow on users, a live debounced
 * input on universities and directions, selects-only on question pairs, and no
 * filtering at all on motivation statements/pairs and feedback.
 *
 * Everything lives on ONE baseline-aligned row: search, selects, then the
 * result count pushed to the right. The search field previously carried a
 * second line under it ("ТОЛЬКО ПО EMAIL"), which made it taller than the
 * selects beside it and left the whole row visibly crooked — a scope note is
 * now either folded into the placeholder or hung off the row as quiet prose.
 *
 * Each select carries its own name inside its border ("Возраст ▾ Middle"), so
 * the row states what is filtered without a second row of chips repeating it —
 * an earlier pass had both, and a bare "Middle" in a select needed the chip
 * below to explain which filter it belonged to.
 */

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminSelectFilter {
  key: string;
  /** Rendered beside the control, inside its border — see `FilterSelect`. */
  label: string;
  value: string;
  options: readonly AdminFilterOption[];
}

interface AdminToolbarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  selects?: readonly AdminSelectFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onClearAll?: () => void;
  /**
   * Something the admin needs to know about this list's search or data that
   * the placeholder can't carry — e.g. "не находит по городу". Quiet prose at
   * the end of the row, never a shouting label.
   */
  hint?: ReactNode;
  /** e.g. "314 вопросов" — the count this filter set produced. */
  summary?: ReactNode;
  /** Export, refresh — page-level actions belong in the page header instead. */
  actions?: ReactNode;
}

export function AdminToolbar({
  search,
  selects = [],
  onFilterChange,
  onClearAll,
  hint,
  summary,
  actions,
}: AdminToolbarProps) {
  const activeSelects = selects.filter((s) => s.value);
  const hasActive = activeSelects.length > 0 || Boolean(search?.value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {search && (
          <DebouncedSearchInput
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
          />
        )}

        {selects.map((filter) => (
          <FilterSelect
            key={filter.key}
            filter={filter}
            onChange={(value) => onFilterChange?.(filter.key, value)}
          />
        ))}

        {actions}

        {hasActive && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              ADMIN_TEXT,
              'text-muted hover:text-primary underline underline-offset-2 transition-colors',
            )}
          >
            Сбросить
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {hint && <span className={ADMIN_META}>{hint}</span>}
          {summary && <span className={ADMIN_META}>{summary}</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * A filter's name lives beside the control, not inside every option.
 *
 * A native `<select>` shows the selected option's own text when closed, so the
 * only way to make a closed control read "Страна: Казахстан" is to prefix all
 * of its options — which then repeats "Страна:" down thirty rows of an open
 * dropdown. Putting the label in the shared border says it once: the control
 * reads as one unit closed, and the list stays clean when opened.
 */
function FilterSelect({
  filter,
  onChange,
}: {
  filter: AdminSelectFilter;
  onChange: (value: string) => void;
}) {
  const active = Boolean(filter.value);

  return (
    <span
      className={cn(
        ADMIN_CONTROL,
        'inline-flex items-center gap-1.5 h-8 py-0 pr-1.5',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)]',
        active && 'border-brand',
      )}
    >
      {/* Colon lives here, on the one label, so the closed control reads
          "Страна: Казахстан" while the open list stays free of it. */}
      <span className={cn(ADMIN_TEXT, 'text-muted whitespace-nowrap select-none')}>{filter.label}:</span>
      <span className="relative inline-flex items-center">
        <select
          value={filter.value}
          aria-label={filter.label}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            ADMIN_TEXT,
            'appearance-none bg-transparent border-0 outline-none pr-4 pl-0 cursor-pointer',
            // A native select is as wide as its longest option, even while
            // showing a short one — one filter with a long option name pushed
            // the rest of the row onto a second line. The cap keeps the row
            // together; the closed control ellipsizes instead.
            'max-w-[168px] text-ellipsis',
            active ? 'text-brand font-medium' : 'text-secondary',
          )}
        >
          <option value="">любой</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={cn('absolute right-0 pointer-events-none', active ? 'text-brand' : 'text-muted')}
        />
      </span>
    </span>
  );
}

/**
 * Local draft state + debounce, so typing stays responsive while the URL (and
 * therefore the request) only updates once the admin pauses. Resyncs when the
 * value changes from outside — clearing a chip, or landing on a link that
 * already carries `?search=`.
 */
function DebouncedSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = draft;
      onChange(draft.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, onChange]);

  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        // Browsers remember what's typed into a search field and offer it back
        // as a native dropdown — which here covered the results table with a
        // list of the admin's own past typos.
        autoComplete="off"
        spellCheck={false}
        className={cn(ADMIN_CONTROL, 'h-8 pl-7 pr-7 w-[260px] max-w-full [&::-webkit-search-cancel-button]:hidden')}
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft('')}
          aria-label="Очистить поиск"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
