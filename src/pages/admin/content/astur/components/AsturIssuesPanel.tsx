import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturBankIssue } from '@/shared/types';

interface AsturIssuesPanelProps {
  issues: AsturBankIssue[];
  /** Server validation reflects the last SAVED draft. */
  stale: boolean;
  /** False while the saved draft equals its base version. */
  hasChanges: boolean;
  onSelect: (subtest: string | null, itemId: string | null) => void;
}

/** Server-side validation of the draft: every problem that blocks
 *  publishing, each one clickable to jump to its item. */
export function AsturIssuesPanel({ issues, stale, hasChanges, onSelect }: AsturIssuesPanelProps) {
  if (issues.length === 0) {
    const message = stale
      ? 'Сохраните черновик, чтобы перепроверить изменения.'
      : hasChanges
        ? 'Проверки пройдены — черновик можно публиковать.'
        : 'Черновик пока совпадает с опубликованной версией — публиковать нечего.';
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-[14px] border border-default">
        <CheckCircle2 size={15} className="text-success flex-shrink-0" aria-hidden="true" />
        <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{message}</p>
      </div>
    );
  }

  return (
    <div role="alert" className="flex flex-col gap-2 p-3.5 rounded-[14px] border border-danger bg-danger-subtle">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-danger flex-shrink-0" aria-hidden="true" />
        <p className={cn(ADMIN_TEXT, 'font-semibold text-danger m-0')}>
          Нельзя опубликовать: {issues.length} замечани{issues.length === 1 ? 'е' : issues.length < 5 ? 'я' : 'й'}
          {stale ? ' (по последнему сохранению)' : ''}
        </p>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col gap-1 max-h-64 overflow-y-auto">
        {issues.map((issue, i) => (
          <li key={`${issue.code}-${issue.item_id}-${issue.field}-${i}`}>
            <button
              type="button"
              onClick={() => onSelect(issue.subtest, issue.item_id)}
              className={cn(ADMIN_TEXT, 'text-left text-primary hover:text-brand')}
            >
              {issue.item_id ?? issue.subtest ?? 'Банк'}: {issue.message}
            </button>
            <span className={cn(ADMIN_META, 'ml-2')}>{issue.code}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
