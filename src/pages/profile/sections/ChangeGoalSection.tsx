import { Target } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/config/constants';
import type { AssessmentGoal } from '@/shared/types';

export interface ChangeGoalSectionProps {
  currentGoal: AssessmentGoal | null;
  availableGoals: AssessmentGoal[];
  pickerOpen: boolean;
  isPending: boolean;
  limitReached: boolean;
  errorMessage: string | null;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (goal: AssessmentGoal) => void;
}

export function ChangeGoalSection({
  currentGoal,
  availableGoals,
  pickerOpen,
  isPending,
  limitReached,
  errorMessage,
  onOpen,
  onClose,
  onSelect,
}: ChangeGoalSectionProps) {
  if (!currentGoal) return null;

  if (pickerOpen) {
    return (
      <Card>
        <p className="text-label font-extrabold text-primary mb-1">Выбери новую цель</p>
        <p className="text-caption text-secondary mb-4">
          Твой тест и результаты останутся прежними — изменится только фокус рекомендаций.
        </p>

        <div className="flex flex-col gap-2 mb-3">
          {availableGoals.map(goal => (
            <button
              key={goal}
              type="button"
              disabled={isPending}
              onClick={() => onSelect(goal)}
              className="w-full min-h-11 px-4 flex items-center justify-center rounded-[var(--radius)] border-[1.5px] border-default bg-surface font-extrabold text-body text-primary transition-colors hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ASSESSMENT_GOAL_LABELS[goal]}
            </button>
          ))}
        </div>

        {errorMessage && (
          <p className="text-caption text-danger mb-3">{errorMessage}</p>
        )}

        <Button variant="ghost" size="sm" className="w-full" onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={limitReached}
      className="w-full min-h-14 flex items-center justify-center gap-2 rounded-[var(--radius)] border-[1.5px] border-default bg-surface text-brand font-extrabold transition-colors hover:bg-hover text-body disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Target size={16} />
      {limitReached ? 'Лимит смены цели исчерпан' : `Цель: ${ASSESSMENT_GOAL_LABELS[currentGoal]} · изменить`}
    </button>
  );
}
