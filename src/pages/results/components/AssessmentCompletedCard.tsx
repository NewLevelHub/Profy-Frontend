import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';

interface AssessmentCompletedCardProps {
  onOpenProfile: () => void;
  onOpenUniversities: () => void;
}

/** Shown on /results after the student finished the test but the report is
 *  not published yet (PRO-401). Replaces the old "almost ready / waiting for
 *  psychologist" empty state — this is a done state with somewhere to go,
 *  not a waiting room. */
export function AssessmentCompletedCard({
  onOpenProfile,
  onOpenUniversities,
}: AssessmentCompletedCardProps) {
  const { t } = useTranslation('results');

  return (
    <Card
      className={cn(
        'rd-result-state journey-shell flex flex-col gap-7 !bg-transparent border-0 p-6 sm:p-8',
      )}
    >
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <span className="journey-kicker">{t('completedPending.kicker')}</span>
          <Heading level="display-lg" className="text-[color:var(--text-heading)] text-balance">
            {t('completedPending.title')}
          </Heading>
          <Text variant="body-sm" className="text-secondary max-w-[52ch]">
            {t('completedPending.body')}
          </Text>
        </div>
        <div className="rd-result-state-art">
          <img src="/mascot/redesign/celebrate.png" alt="" width={200} height={220} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-start">
        <Button variant="primary" size="lg" className="rounded-pill" onClick={onOpenProfile}>
          {t('completedPending.ctaProfile')}
        </Button>
        <Button variant="ghost" size="lg" className="rounded-pill" onClick={onOpenUniversities}>
          {t('completedPending.ctaUniversities')}
        </Button>
      </div>
    </Card>
  );
}
