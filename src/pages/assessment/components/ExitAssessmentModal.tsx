import { useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';

interface ExitAssessmentModalProps {
  open: boolean;
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
export function ExitAssessmentModal({ open, onSaveAndExit, onContinue, exiting = false }: ExitAssessmentModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !exiting) onContinue();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onContinue, exiting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-dialog-title"
      onClick={exiting ? undefined : onContinue}
    >
      <div
        className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5"
        onClick={event => event.stopPropagation()}
      >
        <Mascot state="pause" size={96} className="mx-auto" />
        <div className="flex flex-col gap-2">
          <h2 id="exit-dialog-title" className="text-title font-black text-primary">
            Сохранить и продолжить позже?
          </h2>
          <p className="text-body text-secondary">
            Прогресс уже сохранён — можешь выйти сейчас и вернуться в любой момент
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-pill"
            onClick={onSaveAndExit}
            isLoading={exiting}
          >
            Сохранить и выйти
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-pill"
            onClick={onContinue}
            disabled={exiting}
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
