import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';

interface ExitAssessmentModalProps {
  redesigned?: boolean;
  open: boolean;
  title?: string;
  body?: string;
  saveAndExitLabel?: string;
  error?: string | null;
  /**
   * Прогресс сохраняется после каждого ответа, кроме отмеченных-но-
   * неотправленных ответов на текущей неполной странице Likert — эта кнопка
   * сперва дожидается их отправки (см. `exiting`), потом уводит со страницы.
   */
  onSaveAndExit: () => void;
  /** Остаться и продолжить тест — то же действие, что Escape/клик по фону. */
  onContinue: () => void;
  /** true, пока незасохранённые ответы текущей страницы отправляются на бэк. */
  exiting?: boolean;
}

// ТЗ 29.2: нельзя предлагать "выйти без сохранения" как основной путь — оба
// действия должны быть равноценными и не деструктивными, поэтому обе кнопки
// рендерятся ghost-вариантом (без заливки), без выделенного "primary" выхода.
export function ExitAssessmentModal({
  redesigned = false,
  open,
  title,
  body,
  saveAndExitLabel,
  error,
  onSaveAndExit,
  onContinue,
  exiting = false,
}: ExitAssessmentModalProps) {
  const { t } = useTranslation('assessment');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
      continueRef.current?.focus();
    }
    if (!open && dialog?.open) dialog.close();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rd-assessment-exit m-auto w-[calc(100%-2rem)] max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto border-0 bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 backdrop:bg-scrim backdrop:backdrop-blur-sm"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={event => { event.preventDefault(); if (!exiting) onContinue(); }}
      onClick={event => {
        if (event.target !== event.currentTarget || exiting) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onContinue();
      }}
    >
      <div className="flex flex-col gap-5">
        {redesigned ? <img src="/mascot/redesign/greeting.png" alt="" width={120} height={120} className="mx-auto" /> : <Mascot state="pause" size={96} className="mx-auto" />}
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-title font-black text-primary">
            {title ?? t('exitModal.title')}
          </h2>
          <p id={bodyId} className="text-body text-secondary">
            {body ?? t(redesigned ? 'redesign.exitBody' : 'exitModal.body')}
          </p>
          {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-pill"
            onClick={onSaveAndExit}
            isLoading={exiting}
          >
            {saveAndExitLabel ?? t('exitModal.saveExit')}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-pill"
            onClick={onContinue}
            disabled={exiting}
            ref={continueRef}
          >
            {t('exitModal.stay')}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
