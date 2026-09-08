import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Spine } from '@/shared/ui/Spine';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { type as typeClass } from '@/shared/ui/typography/tokens';

interface AssessmentInProgressCardProps {
  answeredCount: number;
  totalQuestions: number;
  onContinue: () => void;
}

/** Shown on /results while the assessment is started but not finished —
 *  there is no report to show yet, so the page's only job is "continue the
 *  test" (real progress data only, no fabricated question total). */
export function AssessmentInProgressCard({ answeredCount, totalQuestions, onContinue }: AssessmentInProgressCardProps) {
  const { t } = useTranslation('results');
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className={`${typeClass.monoLabel} text-muted`}>{t('inProgress.kicker')}</span>
          <Heading level="display-lg" className="text-[color:var(--midnight)]">
            {t('inProgress.title')}
          </Heading>
          <Text variant="body-sm" className="text-muted max-w-[52ch]">
            {t('inProgress.body', { answered: answeredCount, total: totalQuestions })}
          </Text>
        </div>
        <Mascot state="transition" size={88} className="flex-shrink-0" />
      </div>

      <div>
        <Spine value={progressPct} ariaLabel={t('inProgress.progressAria')} flat />
        <div className="flex justify-between mt-2 mx-0.5 text-mono-sm">
          <span className="font-bold text-muted">{t('inProgress.progressLabel')}</span>
          <span className="font-bold text-muted">{progressPct}%</span>
        </div>
      </div>

      <Button variant="primary" size="lg" className="rounded-pill self-end" onClick={onContinue}>
        {t('inProgress.cta')}
      </Button>
    </Card>
  );
}
