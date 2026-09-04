import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';

interface AssessmentNotStartedCardProps {
  onStart: () => void;
}

/** Shown on /results before any assessment has been started — results have
 *  nothing to display yet, so this replaces the old separate /home screen
 *  (which showed the exact same "nothing to see" state as a detour). */
export function AssessmentNotStartedCard({ onStart }: AssessmentNotStartedCardProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className={`${typeClass.monoLabel} text-muted`}>ДИАГНОСТИКА · ЕЩЁ НЕ НАЧАТА</span>
          <Heading level="display-lg" className="text-[color:var(--midnight)]">
            Готов начать диагностику?
          </Heading>
          <Text variant="body-sm" className="text-muted max-w-[52ch]">
            Один тест — и мы соберём честную карту твоих сторон и подходящих направлений
          </Text>
        </div>
        <Mascot state="welcome" size={96} interactive className="flex-shrink-0" />
      </div>

      <Button variant="primary" size="lg" className="rounded-pill self-start" onClick={onStart}>
        Начать тест
      </Button>
    </Card>
  );
}
