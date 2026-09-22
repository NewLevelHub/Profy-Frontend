import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { AssessmentStageShell } from '../../components/AssessmentStageShell';
import { CHECKIN_QUESTIONS, SKIPPED } from '../data/checkin';

interface CheckInStepProps {
  onSubmit: (answers: Record<string, string>) => void;
}

/**
 * Check-in §5.2: 3 вопроса, одно касание, пропуск допустим («не указано»).
 * Не оценивается, никакой обратной связи. Отправляется как есть.
 * PRO-397: same journey-shell card as AssessmentIntro so the psycho start
 * matches every other test gate.
 *
 * Группа вопроса — `div role="group"` + `aria-labelledby`, а не
 * `fieldset`/`legend`: для скринридера это то же самое, но `legend`
 * раскладывается движком по особым правилам (в Chromium он вообще не
 * flex-элемент, поэтому `gap-3` на него не действует), и высота карточки
 * из-за этого разная в разных браузерах — PRO-397.
 */
export function CheckInStep({ onSubmit }: CheckInStepProps) {
  const { t } = useTranslation('assessment');
  const [selected, setSelected] = useState<Record<string, string>>({});

  function submit() {
    onSubmit(
      Object.fromEntries(
        CHECKIN_QUESTIONS.map((q) => [q.key, selected[q.key] || SKIPPED]),
      ),
    );
  }

  return (
    <AssessmentStageShell
      centered
      contentClassName="flex flex-col gap-7 !p-8 sm:!p-10"
    >
      {CHECKIN_QUESTIONS.map((q) => (
        <div
          key={q.key}
          role="group"
          aria-labelledby={`checkin-${q.key}`}
          className="flex flex-col gap-3"
        >
          <p id={`checkin-${q.key}`} className="text-body-md font-semibold text-primary">
            {t(`psychoemotional.checkin.${q.key}.label`)}
          </p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt, i) => {
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
                  {t(`psychoemotional.checkin.${q.key}.options.${i}`)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Button
        onClick={submit}
        size="lg"
        className="mt-1 w-full rounded-pill text-body-lg font-extrabold"
        style={{ height: 56 }}
      >
        {t('common:next')}
      </Button>
    </AssessmentStageShell>
  );
}
