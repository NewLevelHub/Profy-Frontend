import { useEffect, useState } from 'react';
import { Spinner } from '@/shared/ui/Spinner';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Mascot } from '@/shared/ui/Mascot';

/** Two-phase generation (skeleton + 4 stage expansions) — up to ~90s. */
const STEPS = [
  'Читаю твои результаты и данные вуза…',
  'Определяю цель и зону роста…',
  'Раскрываю осенний этап…',
  'Раскрываю зимний и весенний этапы…',
  'Собираю поступление и предметы…',
  'Почти готово…',
];

const STEP_MS = 7000;

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
        <h2 className="text-title font-extrabold text-primary">Собираю план развития</h2>
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
      <p className="text-caption text-muted">Это займёт до полутора минут — не закрывай страницу</p>
    </div>
  );
}
