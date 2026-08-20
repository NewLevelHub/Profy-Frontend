import { RotateCcw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

export interface RestartAssessmentSectionProps {
  confirmRestart: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RestartAssessmentSection({ confirmRestart, onRequest, onConfirm, onCancel }: RestartAssessmentSectionProps) {
  if (confirmRestart) {
    return (
      <Card className="border-warning/40 bg-warning-subtle">
        <p className="text-label font-extrabold text-primary mb-1">Начать заново?</p>
        <p className="text-caption text-secondary mb-4">
          Весь текущий прогресс будет сброшен. Ты начнёшь диагностику с самого начала.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onCancel}>
            Отмена
          </Button>
          <Button size="sm" className="flex-1 bg-danger! hover:bg-danger/80!" onClick={onConfirm}>
            Начать заново
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      className="w-full min-h-14 flex items-center justify-center gap-2 rounded-[var(--radius)] border-[1.5px] border-default bg-transparent text-brand font-extrabold transition-colors hover:bg-hover text-body"
    >
      <RotateCcw size={16} />
      Начать тестирование заново
    </button>
  );
}
