import { Undo2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { plural } from '@/shared/lib/plural';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';

/**
 * How many fields of this row are hand-edited, and one way to undo all of them.
 *
 * Per-field reverts live next to their own labels; this exists because "put
 * this row back the way the bank has it" is a different intent from "undo this
 * one field", and doing it field by field is both tedious and easy to leave
 * half-done. Silent until there is something to undo.
 */
export function OverrideNotice({
  count,
  pending,
  disabledReason,
  onRevertAll,
  error,
}: {
  count: number;
  pending: boolean;
  disabledReason?: string;
  onRevertAll: () => void;
  error?: string;
}) {
  if (count === 0 && !error) return null;

  return (
    <div className="flex flex-col gap-1">
      {count > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-raised border border-default rounded-[3px] px-3 py-2">
          <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>
            {count} {plural(count, 'поле задано', 'поля заданы', 'полей заданы')} вручную —
            автообновление контента при деплое их не перезапишет.
          </p>
          <button
            type="button"
            onClick={onRevertAll}
            disabled={pending || Boolean(disabledReason)}
            title={disabledReason}
            className={cn(
              ADMIN_TEXT,
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-[3px] transition-colors',
              'text-muted hover:text-primary hover:bg-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            )}
          >
            <Undo2 size={12} />
            {pending ? 'Снимаю правки…' : 'Снять все правки'}
          </button>
        </div>
      )}
      {error && <p className={cn(ADMIN_META, 'text-danger m-0')}>{error}</p>}
    </div>
  );
}
