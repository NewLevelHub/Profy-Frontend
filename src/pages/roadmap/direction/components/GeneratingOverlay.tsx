import { useEffect, useState } from 'react';
import { Spinner } from '@/shared/ui/Spinner';

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
      <span className="text-5xl select-none" aria-hidden="true">🧭</span>
      <Spinner size="lg" />

      <div className="flex flex-col gap-2">
        <h2 className="text-title font-extrabold text-primary">Собираю твой план</h2>
        <p className="text-body text-secondary">{STEPS[step]}</p>
        <p className="text-caption text-muted">Это займёт до минуты — не закрывай страницу</p>
      </div>
    </div>
  );
}
