import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { CHECKIN_QUESTIONS, SKIPPED } from '../data/checkin';

interface CheckInStepProps {
  onSubmit: (answers: Record<string, string>) => void;
}

/**
 * Check-in §5.2: 3 вопроса, одно касание, пропуск допустим («не указано»).
 * Не оценивается, никакой обратной связи. Отправляется как есть.
 */
export function CheckInStep({ onSubmit }: CheckInStepProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  function submit() {
    onSubmit(
      Object.fromEntries(
        CHECKIN_QUESTIONS.map((q) => [q.key, selected[q.key] || SKIPPED]),
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {CHECKIN_QUESTIONS.map((q) => (
        <fieldset key={q.key} className="flex flex-col gap-3">
          <legend className="mb-1 text-body-sm font-semibold text-primary">{q.label}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const isSelected = selected[q.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  className={cn(
                    'press-scale rounded-pill border-2 px-3.5 py-1.5 text-body-sm font-medium transition-colors',
                    isSelected
                      ? 'border-brand bg-active-tint text-primary'
                      : 'border-default bg-surface text-secondary hover:border-brand',
                  )}
                  onClick={() =>
                    setSelected((s) => ({
                      ...s,
                      [q.key]: s[q.key] === opt ? '' : opt,
                    }))
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <Button onClick={submit} size="lg" className="mt-2 w-full rounded-pill">
        Далее
      </Button>
    </div>
  );
}
