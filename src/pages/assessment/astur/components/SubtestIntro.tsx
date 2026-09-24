import { Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';
import { cn } from '@/shared/lib/cn';
import type { AsturContentSubtest } from '@/shared/types';

interface SubtestIntroProps {
  subtest: AsturContentSubtest;
  index: number;
  count: number;
  onStart: () => void;
}

/** Per-subtest instruction screen — appears up to 8 times per АСТУР run, so it
 *  stays lighter than the block-level <AssessmentIntro> (no mascot/pulse,
 *  those are reserved for once-per-block moments), but still lives in the
 *  same journey-shell card language as the running screens either side of it
 *  (SubtestRunner/LabilityRunner), instead of floating bare on the canvas. */
export function SubtestIntro({ subtest, index, count, onStart }: SubtestIntroProps) {
  const { t } = useTranslation('assessment');
  return (
    <div className="assessment-stage mx-auto w-full max-w-[640px]">
      <div className="assessment-stage__shell journey-shell flex flex-col items-center gap-5 text-center !p-8 sm:!p-10">
        <span
          className={cn(
            typeClass.caption,
            'inline-block bg-brand-subtle text-brand font-extrabold px-[18px] py-[7px] rounded-pill',
          )}
        >
          {t('astur.subtestOf', { index: index + 1, count })}
        </span>

        <Heading level="display-sm" as="h2" className="text-primary">
          {subtest.name}
        </Heading>

        <Text variant="body-lg" className="text-secondary max-w-md whitespace-pre-wrap">
          {subtest.instruction}
        </Text>

        <div className={cn(typeClass.bodySm, 'flex items-center justify-center gap-[18px] font-bold text-subtle')}>
          <span className="inline-flex items-center gap-[6px]">
            <FileText size={15} strokeWidth={1.75} aria-hidden="true" />
            {t('astur.tasksCount', { count: subtest.item_count })}
          </span>
          {subtest.time_limit_sec !== null && (
            <>
              <span className="w-[4px] h-[4px] rounded-full bg-[var(--hairline)]" />
              <span className="inline-flex items-center gap-[6px]">
                <Clock size={15} strokeWidth={1.75} aria-hidden="true" />
                {t('astur.minutesShort', { min: Math.round(subtest.time_limit_sec / 60) })}
              </span>
            </>
          )}
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full max-w-[320px] rounded-pill text-body-lg font-extrabold mt-2"
          style={{ height: 56 }}
        >
          {t('intro.astur.cta')}
        </Button>
      </div>
    </div>
  );
}
