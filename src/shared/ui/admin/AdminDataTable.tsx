import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import { AdminEmpty, AdminTableSkeleton } from '@/shared/ui/admin/AdminStates';

/**
 * The one table used by every admin list.
 *
 * Two things it fixes that were per-page before PRO-242:
 *
 * 1. **Responsiveness.** Only users and universities had a card-per-row layout
 *    below `lg`; the five content lists and feedback were plain
 *    `overflow-x-auto` tables, unreadable on a phone. Declaring each column's
 *    `mobile` role once here gives every list the same card treatment for free.
 *
 * 2. **Loading/empty.** Both states are rendered inside the table shell, so the
 *    surrounding chrome doesn't jump when data arrives.
 *
 * Sorting is opt-in per list, and only where it can be honest. A header offers
 * sorting when the caller passes `onSortChange`, which it may only do if it
 * holds the full result set (the universities catalog does — see
 * `useUniversityCatalog`) or once the backend accepts `?sort=&order=`
 * (docs/admin-backend-requests-pro-242.md §1). Sorting a server page of 20 rows
 * out of 314 would reorder a fifteenth of the data while presenting itself as
 * sorting the list, so lists without either simply don't show the control.
 */

export type AdminColumnAlign = 'left' | 'right';

/**
 * How a column is presented once the table collapses into cards:
 * - `title`    — the card's headline (usually the linked name)
 * - `subtitle` — dimmer line right under the title (email, slug)
 * - `badge`    — sits in the card's status row (status, override marker)
 * - `field`    — label/value pair in the card's bottom grid
 * - `hidden`   — dropped on narrow screens (raw ids, redundant columns)
 */
export type AdminColumnMobileRole = 'title' | 'subtitle' | 'badge' | 'field' | 'hidden';

export interface AdminColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: AdminColumnAlign;
  /** Sort field. Only rendered as a control when `onSortChange` is passed. */
  sortKey?: string;
  /** Explains a column whose meaning isn't obvious from its header. */
  headerTitle?: string;
  mobile?: AdminColumnMobileRole;
  /** Overrides the header text as the card's field label. */
  mobileLabel?: string;
  /**
   * This column absorbs the leftover width; every other column is pinned to
   * `width`. Defaults to the `title` column. Exactly one column claims the
   * slack — see the layout note on `AdminDataTable`.
   */
  grow?: boolean;
  /** Fixed CSS width for this column, e.g. "160px". Ignored on the grow column. */
  width?: string;
  /** Lets this column's cells wrap onto several lines instead of ellipsizing. */
  wrap?: boolean;
  className?: string;
}

export interface AdminSort {
  key: string;
  order: 'asc' | 'desc';
}

interface AdminDataTableProps<T> {
  columns: readonly AdminColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  /** Makes the whole card tappable on mobile; the desktop row keeps its own link. */
  rowHref?: (row: T) => string;
  emptyTitle?: string;
  emptyHint?: ReactNode;
  emptyAction?: ReactNode;
  sort?: AdminSort;
  onSortChange?: (sort: AdminSort) => void;
  /** Caption for screen readers describing what the table lists. */
  label: string;
}

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  rowHref,
  emptyTitle = 'Ничего не найдено',
  emptyHint,
  emptyAction,
  sort,
  onSortChange,
  label,
}: AdminDataTableProps<T>) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        <AdminTableSkeleton columns={Math.min(columns.length, 5)} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        <AdminEmpty title={emptyTitle} hint={emptyHint} action={emptyAction} />
      </div>
    );
  }

  const titleColumn = columns.find((c) => c.mobile === 'title') ?? columns[0];
  const subtitleColumns = columns.filter((c) => c.mobile === 'subtitle');
  const badgeColumns = columns.filter((c) => c.mobile === 'badge');
  const fieldColumns = columns.filter((c) => c.mobile === 'field');

  /**
   * Fixed table layout: every column but one gets an explicit width, declared
   * once in a `<colgroup>`, and the remaining column absorbs the slack.
   *
   * Without this the browser sizes each column from whatever rows happen to be
   * on screen, so the entire table re-laid out on every sort and every page
   * turn — page one's "Усть-Каменогорск, Казахстан" made a wide city column,
   * page two's "Алматы" made a narrow one, and all the numbers slid sideways
   * between the two. Content-based sizing cannot be stable when the content
   * changes underneath it.
   */
  const growColumn = columns.find((c) => c.grow) ?? titleColumn;
  const columnWidth = (column: AdminColumn<T>) =>
    column.width ?? (column.align === 'right' ? '112px' : '168px');

  /**
   * Floor for the grow column, and with it the point where the table starts
   * scrolling sideways instead of compressing further.
   *
   * Keep this tight. Every pixel of `minWidth` above the actual container width
   * turns into a horizontally scrolled table whose last column is cut in half —
   * and macOS hides the scrollbar until you scroll, so the clipping reads as a
   * rendering bug, not as "there is more to the right". A too-narrow grow column
   * is a smaller problem than a hidden one.
   */
  const GROW_COLUMN_MIN = 200;
  const minTableWidth =
    columns
      .filter((column) => column !== growColumn)
      .reduce((sum, column) => sum + (Number.parseInt(columnWidth(column), 10) || 0), 0) +
    GROW_COLUMN_MIN;

  return (
    <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
      {/* Desktop: full table */}
      <div className="hidden lg:block overflow-x-auto">
        <table
          className={cn('w-full table-fixed', ADMIN_TEXT)}
          style={{ minWidth: `${minTableWidth}px` }}
        >
          <caption className="sr-only">{label}</caption>
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={column === growColumn ? undefined : { width: columnWidth(column) }}
              />
            ))}
          </colgroup>
          <thead className="bg-[color-mix(in_srgb,var(--paper)_62%,transparent)] border-b border-[color:color-mix(in_srgb,var(--border)_70%,transparent)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  title={column.headerTitle}
                  aria-sort={
                    column.sortKey && sort?.key === column.sortKey
                      ? sort.order === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    ADMIN_CELL,
                    MONO_LABEL,
                    'text-muted font-medium whitespace-nowrap overflow-hidden',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.sortKey && onSortChange ? (
                    <SortableHeader
                      column={column}
                      sort={sort}
                      onSortChange={onSortChange}
                    />
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <tr
                  key={rowKey(row)}
                  // The whole row is the target, not just the name link in the
                  // first cell — a 13px link inside a 40px row is a small thing
                  // to hit when you are working down a list. The link stays for
                  // keyboard, middle-click and "open in new tab"; text
                  // selection and clicks on nested controls are left alone.
                  onClick={href ? (event) => handleRowClick(event, href, navigate) : undefined}
                  className={cn(
                    'border-b border-default last:border-b-0 transition-colors',
                    href && 'cursor-pointer hover:bg-hover',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        ADMIN_CELL,
                        'align-top overflow-hidden',
                        // One line per cell keeps row heights identical; the
                        // full value stays reachable in the row's detail page.
                        column.wrap ? 'whitespace-normal' : 'whitespace-nowrap text-ellipsis',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Below lg: one card per row */}
      <ul className="lg:hidden divide-y divide-[var(--border)]">
        {rows.map((row) => {
          const href = rowHref?.(row);
          const card = (
            <div className={cn(ADMIN_TEXT, 'p-3 flex flex-col gap-2.5')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-primary truncate">{titleColumn.cell(row)}</div>
                  {subtitleColumns.map((column) => (
                    <div key={column.key} className="font-mono text-mono-xs text-muted mt-0.5 truncate">
                      {column.cell(row)}
                    </div>
                  ))}
                </div>
                {badgeColumns.length > 0 && (
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {badgeColumns.map((column) => (
                      <div key={column.key}>{column.cell(row)}</div>
                    ))}
                  </div>
                )}
              </div>

              {fieldColumns.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-default m-0">
                  {fieldColumns.map((column) => (
                    <div key={column.key}>
                      <dt className={MONO_MUTE}>{column.mobileLabel ?? column.header}</dt>
                      <dd className="text-muted mt-0.5">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );

          return (
            <li key={rowKey(row)}>
              {href ? (
                <Link to={href} className="block hover:bg-hover transition-colors">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Row-level navigation that stays out of the way of everything else a row can
 * do: modifier-clicks (new tab), clicks that land on a real link or button,
 * and text selection all keep their normal behaviour.
 */
function handleRowClick(
  event: MouseEvent<HTMLTableRowElement>,
  href: string,
  navigate: ReturnType<typeof useNavigate>,
) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if ((event.target as HTMLElement).closest('a, button, input, select, textarea, label')) return;
  if (window.getSelection()?.toString()) return;
  navigate(href);
}

function SortableHeader<T>({
  column,
  sort,
  onSortChange,
}: {
  column: AdminColumn<T>;
  sort?: AdminSort;
  onSortChange: (sort: AdminSort) => void;
}) {
  const isActive = sort?.key === column.sortKey;
  const nextOrder: AdminSort['order'] = isActive && sort?.order === 'asc' ? 'desc' : 'asc';

  return (
    <button
      type="button"
      onClick={() => onSortChange({ key: column.sortKey!, order: nextOrder })}
      title={`Сортировать по «${typeof column.header === 'string' ? column.header : column.key}»`}
      className={cn(
        'group/sort inline-flex items-center gap-1 transition-colors',
        isActive ? 'text-brand' : 'hover:text-primary',
      )}
    >
      {column.header}
      {/* The inactive arrow fades in on hover: a sortable header needs to look
          sortable before it is clicked, but a permanent arrow on every column
          reads as if everything is already sorted. */}
      <ArrowUp
        size={11}
        aria-hidden="true"
        className={cn(
          'transition-all',
          isActive
            ? cn('opacity-100', sort?.order === 'desc' && 'rotate-180')
            : 'opacity-0 group-hover/sort:opacity-50',
        )}
      />
    </button>
  );
}
