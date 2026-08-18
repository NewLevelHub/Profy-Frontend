import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Spine } from '@/shared/ui/Spine';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { KICKER_CLASS } from './HomeFrame';

interface InProgressOverviewProps {
  answeredCount: number;
  totalQuestions: number;
  onContinue: () => void;
}

/**
 * Assessment started but not finished — not covered by the spec §04 excerpt
 * (which only shows the completed state), so this reuses the same visual
 * language (Fog-bordered card, mono kicker, display headline, Spine
 * progress, Mascot, Pine primary action) rather than inventing a new one.
 * Real progress data only (answeredCount/totalQuestions from the assessment
 * store) — no fabricated question total or fixed step count.
 */
export function InProgressOverview({ answeredCount, totalQuestions, onContinue }: InProgressOverviewProps) {
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className={KICKER_CLASS}>ДИАГНОСТИКА · В ПРОЦЕССЕ</span>
          <Heading level="display-lg" className="text-[color:var(--midnight)]">
            Ты уже в пути
          </Heading>
          <Text variant="body-sm" className="text-muted max-w-[52ch]">
            Отвечено {answeredCount} из {totalQuestions} вопросов — можно продолжить в любой момент
          </Text>
        </div>
        <Mascot state="transition" size={88} className="flex-shrink-0" />
      </div>

      <Spine value={progressPct} ariaLabel="Прогресс диагностики" />

      <Button variant="primary" size="lg" className="rounded-pill self-start" onClick={onContinue}>
        Продолжить тест
      </Button>
    </div>
  );
}
