import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Spine } from '@/shared/ui/Spine';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';

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
    <Card
      className={cn(
        'journey-shell flex flex-col gap-7 !bg-transparent border-0 p-6 sm:p-8',
      )}
    >
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <span className="journey-kicker">{t('inProgress.kicker')}</span>
          <Heading level="display-lg" className="text-[color:var(--text-heading)] text-balance">
            {t('inProgress.title')}
          </Heading>
          <Text variant="body-sm" className="text-secondary max-w-[52ch]">
            {t('inProgress.body', { answered: answeredCount, total: totalQuestions })}
          </Text>
        </div>
        <div className="journey-mascot-well">
          <Mascot state="transition" size={88} />
        </div>
      </div>

      <div className="journey-progress">
        <Spine value={progressPct} ariaLabel={t('inProgress.progressAria')} flat />
        <div className="flex justify-between mt-2.5 mx-0.5">
          <span className="text-caption font-semibold text-muted">{t('inProgress.progressLabel')}</span>
          <span className="font-mono text-mono-sm font-semibold" style={{ color: 'var(--pine)' }}>
            {progressPct}%
          </span>
        </div>
      </div>

      <div className="journey-tip">
        <span className="journey-tip-dot" aria-hidden="true" />
        <Text variant="body-sm" className="text-primary">
          Никуда не спеши: ответы сохраняются сами. Когда вернёшься — продолжим с того же места.
        </Text>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="lg" className="rounded-pill" onClick={onContinue}>
          {t('inProgress.cta')}
        </Button>
      </div>
    </Card>
  );
}
