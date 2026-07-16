import { Button } from '@/shared/ui/Button';

interface ResultEmptyStateProps {
  onStart: () => void;
}

// Shown when there's no completed assessment yet (or the result isn't
// ready) — a CTA back into the test, not a 404/blank screen.
export function ResultEmptyState({ onStart }: ResultEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
      <span className="text-5xl select-none" aria-hidden="true">📋</span>
      <h2 className="text-h1 font-extrabold text-primary">Результата пока нет</h2>
      <p className="text-body text-secondary max-w-xs">
        Пройди диагностику до конца, чтобы увидеть подходящее направление
      </p>
      <Button onClick={onStart}>Пройти тест</Button>
    </div>
  );
}
