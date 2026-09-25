import { useEffect, useId, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { type as typeClass } from '@/shared/ui/typography/tokens';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Пока confirm в полёте — кнопки блокируются, на confirm крутится спиннер. */
  confirming?: boolean;
}

/**
 * Стилизованный confirm вместо `window.confirm` — scrim + surface card, как
 * у CreateStaffModal: кнопки в ряд, «Отмена» слева и с фокусом, чтобы Enter
 * по привычке не подтвердил необратимое. Для вызова из обработчиков без
 * своего state есть `confirm()` из `@/shared/lib/confirm`.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirming = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const bodyId = useId();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !confirming) onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, confirming]);

  // Фокус на «Отмену», а по закрытию — обратно на кнопку, открывшую диалог,
  // как у нативного confirm. Не autoFocus: он срабатывает раньше эффекта, и
  // запомнить, откуда пришли, уже нельзя.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => returnFocusRef.current?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      onClick={confirming ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm bg-raised rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className={cn(typeClass.bodyLg, 'font-semibold text-heading m-0')}>
            {title}
          </h2>
          {body ? (
            <p id={bodyId} className={cn(typeClass.bodyMd, 'text-secondary m-0')}>
              {body}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={confirming}
            ref={cancelRef}
            // muteSound: в админке/у психолога клик-звук лишний
            muteSound
          >
            {cancelLabel}
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm} isLoading={confirming} muteSound>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
