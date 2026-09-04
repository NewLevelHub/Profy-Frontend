import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Lock, Undo2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';

export type SaveState = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string };

interface AdminSaveBarProps {
  dirty: boolean;
  saving: boolean;
  /** Field labels that changed — named, so "Сохранить" is never a blind action. */
  changedLabels: readonly string[];
  onSave: () => void;
  onReset: () => void;
  state: SaveState;
  /**
   * True for entities whose PATCH also locks the sent fields against the next
   * content-bank re-sync. The bar then spells that consequence out.
   */
  locksOnSave?: boolean;
  /** Blocks saving with an explanation — e.g. invalid JSON in the grants field. */
  blockedReason?: string | null;
}

/**
 * Sticky save bar — one per detail screen, appearing only when the form is dirty.
 *
 * Before PRO-242 saving was a "Сохранить" button in the header of whichever card
 * happened to be first (on the program screen, one button silently covered four
 * cards), with the result reported as a tiny uppercase mono string next to it
 * that never cleared. There was no way to discard edits, and no warning when
 * navigating away mid-edit.
 *
 * The bar also carries the consequence that was previously invisible: on
 * content and university/program screens, every field included in the PATCH is
 * locked against the automated seed re-sync — permanently, since no unlock
 * endpoint exists (see docs/admin-backend-requests-pro-242.md §4). An admin
 * fixing a typo is making a lasting decision about that field's ownership, so
 * the bar names the fields it is about to lock rather than leaving it to a
 * tooltip on a padlock icon.
 */
export function AdminSaveBar({
  dirty,
  saving,
  changedLabels,
  onSave,
  onReset,
  state,
  locksOnSave,
  blockedReason,
}: AdminSaveBarProps) {
  const [showSaved, setShowSaved] = useState(false);

  // The success confirmation is transient; the old UI left "СОХРАНЕНО" on
  // screen indefinitely, so it stopped reading as feedback about this action.
  useEffect(() => {
    if (state.kind !== 'saved') return;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 3200);
    return () => clearTimeout(timer);
  }, [state]);

  const visible = dirty || saving || showSaved || state.kind === 'error';
  if (!visible) return null;

  const settled = !dirty && !saving;

  return (
    <div
      className="sticky bottom-0 z-30 -mx-4 sm:mx-0 border-t border-strong sm:border sm:rounded-[3px] bg-surface"
      role="region"
      aria-label="Сохранение изменений"
    >
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          {settled && showSaved ? (
            <p className={cn(ADMIN_TEXT, 'flex items-center gap-1.5 text-brand font-semibold m-0')}>
              <Check size={14} />
              Сохранено
            </p>
          ) : state.kind === 'error' && !dirty ? (
            <p className={cn(ADMIN_TEXT, 'flex items-center gap-1.5 text-danger font-semibold m-0')}>
              <AlertTriangle size={14} />
              {state.message}
            </p>
          ) : (
            <>
              <p className={cn(ADMIN_TEXT, 'text-primary font-semibold m-0')}>
                {changedLabels.length > 0
                  ? `Изменено: ${changedLabels.join(', ')}`
                  : 'Есть несохранённые изменения'}
              </p>
              {locksOnSave && changedLabels.length > 0 && (
                // Предложение, а не машинная метка: моноширинный капс здесь
                // читался как код и терялся ровно там, где важен смысл.
                <p className={cn(ADMIN_META, 'flex items-start gap-1.5 mt-1')}>
                  <Lock size={11} className="mt-[3px] flex-shrink-0" />
                  <span>
                    После сохранения{' '}
                    {changedLabels.length === 1
                      ? 'это поле перестанет'
                      : 'эти поля перестанут'}{' '}
                    обновляться из контент-банка при деплое
                  </span>
                </p>
              )}
              {state.kind === 'error' && (
                <p className={cn(ADMIN_TEXT, 'text-danger mt-1')}>{state.message}</p>
              )}
            </>
          )}
        </div>

        {!settled && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={onReset} disabled={saving} className={cn(ADMIN_BUTTON, ADMIN_TEXT)}>
              <Undo2 size={12} />
              Отменить
            </button>
            <Button
              size="sm"
              muteSound
              onClick={onSave}
              isLoading={saving}
              disabled={Boolean(blockedReason)}
              title={blockedReason ?? undefined}
            >
              Сохранить
            </Button>
          </div>
        )}
      </div>

      {blockedReason && dirty && (
        <p className={cn(ADMIN_TEXT, 'px-4 pb-3 -mt-1 text-danger')}>{blockedReason}</p>
      )}
    </div>
  );
}
