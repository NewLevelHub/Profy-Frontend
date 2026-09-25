import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturBankIssue } from '@/shared/types';

interface AsturPublishModalProps {
  open: boolean;
  keyChangedItemIds: string[];
  publishing: boolean;
  issues: AsturBankIssue[];
  onPublish: (confirmedItemIds: string[]) => void;
  onClose: () => void;
}

/** Publishing freezes the draft for good. Every item whose options or key
 *  changed must be ticked off explicitly — a re-keyed question is never
 *  published by accident. */
export function AsturPublishModal({ open, keyChangedItemIds, publishing, issues, onPublish, onClose }: AsturPublishModalProps) {
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setConfirmed(new Set());
  }, [open]);

  if (!open) return null;

  const allConfirmed = keyChangedItemIds.every((id) => confirmed.has(id));
  const toggle = (id: string) =>
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="astur-publish-title"
      onClick={publishing ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="astur-publish-title" className="text-title font-black text-primary m-0">
          Опубликовать новую версию?
        </h2>
        <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
          Опубликованная версия не редактируется. Новые попытки учеников начнутся на ней; уже начатые и завершённые
          попытки останутся на своих версиях и не пересчитываются.
        </p>

        {keyChangedItemIds.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
              Подтвердите новые ключи ({keyChangedItemIds.length}):
            </p>
            <ul className="m-0 p-0 list-none flex flex-col gap-1 max-h-48 overflow-y-auto">
              {keyChangedItemIds.map((id) => (
                <li key={id}>
                  <label className={cn(ADMIN_TEXT, 'flex items-center gap-2 cursor-pointer')}>
                    <input type="checkbox" checked={confirmed.has(id)} onChange={() => toggle(id)} />
                    {id} — варианты или ключ изменены, ключ проверен
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issues.length > 0 && (
          <ul role="alert" className="m-0 pl-4 flex flex-col gap-0.5">
            {issues.map((issue, i) => (
              <li key={i} className={cn(ADMIN_META, 'text-danger')}>
                {issue.item_id ?? issue.subtest ?? 'Банк'}: {issue.message}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={publishing}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={() => onPublish([...confirmed])}
            disabled={publishing || !allConfirmed}
          >
            {publishing ? 'Публикуем…' : 'Опубликовать'}
          </Button>
        </div>
      </div>
    </div>
  );
}
