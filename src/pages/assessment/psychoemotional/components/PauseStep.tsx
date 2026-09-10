import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { PausePerceptualTask } from './PausePerceptualTask';

/** §5.4: пауза ≥ 120 с (ориентир 120–180). Нельзя пропустить/сократить. */
export const PAUSE_MIN_SEC = 120;

interface PauseStepProps {
  /** epoch ms начала паузы (из стора). */
  startedAt: number;
  /** Пользователь нажал «Продолжить» — фактическая длительность в секундах. */
  onContinue: (actualSec: number) => void;
}

/**
 * Экран паузы. Без обратного таймера/счётчика: кнопка «Продолжить» просто не
 * показывается, пока не прошло `PAUSE_MIN_SEC`, затем появляется молча.
 * Никаких анкетных вопросов (§5.4).
 */
export function PauseStep({ startedAt, onContinue }: PauseStepProps) {
  const [unlocked, setUnlocked] = useState(
    () => Date.now() - startedAt >= PAUSE_MIN_SEC * 1000,
  );
  const startedAtRef = useRef(startedAt);

  useEffect(() => {
    if (unlocked) return;
    const remainingMs = PAUSE_MIN_SEC * 1000 - (Date.now() - startedAtRef.current);
    const t = setTimeout(() => setUnlocked(true), Math.max(0, remainingMs));
    return () => clearTimeout(t);
  }, [unlocked]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-10 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-lg font-medium">Небольшая пауза</p>
        <p className="max-w-[360px] text-sm" style={{ color: '#71717A' }}>
          Отвлекись на пару минут на это задание. Кнопка появится сама.
        </p>
      </div>

      <PausePerceptualTask />

      {unlocked && (
        <Button
          size="lg"
          onClick={() =>
            onContinue(Math.round((Date.now() - startedAtRef.current) / 1000))
          }
        >
          Продолжить
        </Button>
      )}
    </div>
  );
}
