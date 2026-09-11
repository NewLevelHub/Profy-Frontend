import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';

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
    <div className="flex flex-col items-center gap-8 text-center">
      {/* `pause` — тот же маскот, что уже держит паузу в ExitAssessmentModal.
         `interactive` включает лёгкое idle-дыхание — экран держит ≥120с, так
         что маскот должен читаться живым/занятым, а не статичной картинкой. */}
      <Mascot state="pause" size={120} interactive />
      <div className="flex flex-col items-center gap-2">
        <Heading level="display-sm" as="h2" className="text-primary">
          Небольшая пауза
        </Heading>
        <Text variant="body-sm" className="text-muted max-w-[320px]">
          Отвлекись на пару минут. Кнопка появится сама.
        </Text>
      </div>

      {unlocked && (
        <Button
          size="lg"
          className="w-full rounded-pill"
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
