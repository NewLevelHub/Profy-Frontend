import { useEffect, useState } from 'react';
import { Spinner } from '@/shared/ui/Spinner';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mascot } from '@/shared/ui/Mascot';

/** Generation takes up to ~60s — rotate the copy so it never looks frozen. */
const STEPS = [
  'Читаю твои результаты…',
  'Ищу, кем ты можешь стать в этом направлении…',
  'Нахожу твою точку роста…',
  'Собираю план на 12 месяцев…',
  'Почти готово…',
];

const STEP_MS = 6000;

export function GeneratingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep(prev => Math.min(prev + 1, STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <Mascot state="waiting" size={140} />
      <Spinner size="lg" />

      <div className="flex flex-col gap-2">
        <h2 className="text-title font-extrabold text-primary">Собираю твой план</h2>
        <p className="text-body text-secondary">{STEPS[step]}</p>
      </div>

      <div className="w-full max-w-xs">
        <Spine
          nodes={STEPS.map((_, i): SpineNode => ({
            id: i,
            status: i < step ? 'done' : i === step ? 'current' : 'upcoming',
            goal: i === STEPS.length - 1,
          }))}
          thickness={0.85}
          ariaLabel={`Шаг ${step + 1} из ${STEPS.length}`}
        />
      </div>

      <p className="text-caption text-muted">Это займёт до минуты — не закрывай страницу</p>
    </div>
  );
}
