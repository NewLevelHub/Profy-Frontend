import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { KICKER_CLASS } from './HomeFrame';

interface NotStartedOverviewProps {
  onStart: () => void;
}

/**
 * No assessment started yet — not covered by the spec §04 excerpt (which
 * only shows the completed state), so this reuses the same visual language
 * as the other two /home states rather than inventing a new one.
 */
export function NotStartedOverview({ onStart }: NotStartedOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className={KICKER_CLASS}>ДИАГНОСТИКА · ЕЩЁ НЕ НАЧАТА</span>
          <Heading level="display-lg" className="text-[color:var(--midnight)]">
            Готов начать диагностику?
          </Heading>
          <Text variant="body-sm" className="text-muted max-w-[52ch]">
            Один тест — и мы соберём честную карту твоих сторон и подходящих направлений
          </Text>
        </div>
        <Mascot state="welcome" size={96} className="flex-shrink-0" />
      </div>

      <Button variant="primary" size="lg" className="rounded-pill self-start" onClick={onStart}>
        Начать тест
      </Button>
    </div>
  );
}
