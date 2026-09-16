import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import type { AsturContentSubtest } from '@/shared/types';

interface SubtestIntroProps {
  subtest: AsturContentSubtest;
  index: number;
  count: number;
  onStart: () => void;
}

export function SubtestIntro({ subtest, index, count, onStart }: SubtestIntroProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-10">
      <span className="text-mono-xs text-muted">Субтест {index + 1} из {count}</span>
      <Heading level="display-sm">{subtest.name}</Heading>
      <Text variant="body-md" className="text-secondary max-w-xl whitespace-pre-wrap">
        {subtest.instruction}
      </Text>
      {subtest.time_limit_sec !== null && (
        <Text variant="caption" className="text-muted">
          На этот субтест — {Math.round(subtest.time_limit_sec / 60)} мин.
        </Text>
      )}
      <Button size="lg" onClick={onStart}>
        Начать
      </Button>
    </div>
  );
}
