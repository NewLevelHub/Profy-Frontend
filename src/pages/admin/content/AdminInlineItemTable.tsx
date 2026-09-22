import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';

export interface AdminInlineItemColumn<T> {
  key: string;
  header: string;
  width?: string;
  cell: (row: T, index: number) => ReactNode;
}

interface AdminInlineItemTableProps<T> {
  label: string;
  columns: readonly AdminInlineItemColumn<T>[];
  rows: readonly T[];
  onRowClick: (index: number) => void;
}

/**
 * Compact list → detail picker for a subtest's/section's items.
 *
 * Before this, every item's full edit form rendered inline, one after
 * another — 20 items of textareas on one subtest made the page an
 * unreadably long scroll and buried the save bar at the bottom where
 * nobody thought to look for it. Clicking a row here swaps the list for
 * one item's detail form instead (see the `back` control the caller
 * renders above that form) — same one-thing-at-a-time shape as the
 * question list → question detail screens elsewhere in `/admin/content`,
 * just without a real route per item since the save is a single whole-bank
 * PUT, not a per-row PATCH.
 */
export function AdminInlineItemTable<T>({ label, columns, rows, onRowClick }: AdminInlineItemTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-default">
      <table className="w-full table-fixed">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-raised">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
                className={cn(MONO_LABEL, 'text-muted text-left px-3.5 py-2.5 font-medium')}
              >
                {column.header}
              </th>
            ))}
            <th className="w-9" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick(index)}
              className="border-t border-default cursor-pointer hover:bg-hover transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(ADMIN_TEXT, 'px-3.5 py-2.5 align-top text-secondary overflow-hidden text-ellipsis whitespace-nowrap')}
                >
                  {column.cell(row, index)}
                </td>
              ))}
              <td className="px-2 align-middle text-muted">
                <ChevronRight size={14} aria-hidden="true" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
