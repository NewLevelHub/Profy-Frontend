import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';

interface RetakeConfirmModalProps {
  open: boolean;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** «Пройти заново» confirmation — the finished result stays where it is
 *  until the new attempt is fully completed. */
export function RetakeConfirmModal({ open, pending, onConfirm, onCancel }: RetakeConfirmModalProps) {
  const { t } = useTranslation('assessment');

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-scrim backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="astur-retake-title"
      onClick={pending ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5"
        onClick={(event) => event.stopPropagation()}
      >
        <Mascot state="pause" size={96} className="mx-auto" />
        <div className="flex flex-col gap-2">
          <h2 id="astur-retake-title" className="text-title font-black text-primary">
            {t('astur.retake.confirmTitle')}
          </h2>
          <p className="text-body text-secondary">{t('astur.retake.confirmBody')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" onClick={onConfirm} disabled={pending}>
            {pending ? t('astur.retake.starting') : t('astur.retake.confirm')}
          </Button>
          <Button variant="ghost" size="lg" onClick={onCancel} disabled={pending}>
            {t('astur.retake.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
