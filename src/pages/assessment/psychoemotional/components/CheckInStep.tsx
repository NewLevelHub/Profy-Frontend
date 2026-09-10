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
    <div className="mx-auto flex min-h-[100dvh] max-w-[440px] flex-col justify-center gap-8 p-6">
      {CHECKIN_QUESTIONS.map((q) => (
        <fieldset key={q.key} className="flex flex-col gap-3">
          <legend className="mb-1 text-base font-medium leading-snug">{q.label}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm transition-none',
                  selected[q.key] === opt
                    ? 'border-transparent'
                    : 'border-[#D4D4D8]',
                )}
                style={
                  selected[q.key] === opt
                    ? { background: '#18181B', color: '#FAFAFA' }
                    : { background: '#FFFFFF', color: '#3F3F46' }
                }
                onClick={() =>
                  setSelected((s) => ({
                    ...s,
                    [q.key]: s[q.key] === opt ? '' : opt,
                  }))
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <Button onClick={submit} size="lg" className="mt-2 w-full">
        Далее
      </Button>
    </div>
  );
}
