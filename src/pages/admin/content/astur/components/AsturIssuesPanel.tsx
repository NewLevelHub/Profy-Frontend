import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('admin');
  if (issues.length === 0) {
    const message = stale
      ? t('astur.issues.stale')
      : hasChanges
        ? t('astur.issues.ok')
        : t('astur.issues.unchanged');
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
          {t('astur.issues.blocked', { count: issues.length })}
          {stale ? t('astur.issues.staleSuffix') : ''}
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
              {issue.item_id ?? issue.subtest ?? t('astur.issues.bank')}: {issue.message}
            </button>
            <span className={cn(ADMIN_META, 'ml-2')}>{issue.code}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
