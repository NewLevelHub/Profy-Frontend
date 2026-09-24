import { useEffect, useId } from 'react';
import { Button } from '@/shared/ui/Button';

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
 * Стилизованный confirm вместо `window.confirm` — тот же визуальный язык,
 * что у ExitAssessmentModal / CreateStaffModal (scrim + surface card).
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

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !confirming) onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, confirming]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      onClick={confirming ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-title font-black text-primary m-0">
            {title}
          </h2>
          {body ? (
            <p id={bodyId} className="text-body text-secondary m-0">
              {body}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-pill font-extrabold"
            onClick={onConfirm}
            isLoading={confirming}
            // muteSound: в админке/у психолога клик-звук лишний
            muteSound
          >
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-pill"
            onClick={onCancel}
            disabled={confirming}
            muteSound
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
