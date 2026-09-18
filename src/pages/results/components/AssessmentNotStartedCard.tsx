import { useTranslation } from 'react-i18next';
import { Clock, Compass, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';

interface AssessmentNotStartedCardProps {
  onStart: () => void;
}

const HIGHLIGHT_CONFIGS = [
  { Icon: Clock, titleKey: 'notStarted.perks.time', subKey: 'notStarted.perks.timeSub', tone: 'pine' as const },
  { Icon: Shield, titleKey: 'notStarted.perks.noGrades', subKey: 'notStarted.perks.noGradesSub', tone: 'dawn' as const },
  { Icon: Compass, titleKey: 'notStarted.perks.map', subKey: 'notStarted.perks.mapSub', tone: 'iris' as const },
] as const;

/** Shown on /results before any assessment has been started — results have
 *  nothing to display yet, so this replaces the old separate /home screen
 *  (which showed the exact same "nothing to see" state as a detour). */
export function AssessmentNotStartedCard({ onStart }: AssessmentNotStartedCardProps) {
  const { t } = useTranslation('results');
  return (
    <Card
      className={cn(
        'journey-shell flex flex-col gap-7 !bg-transparent border-0 p-6 sm:p-8',
      )}
    >
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <span className="journey-kicker">{t('notStarted.kicker')}</span>
          <Heading level="display-lg" className="text-[color:var(--text-heading)] text-balance">
            {t('notStarted.title')}
          </Heading>
          <Text variant="body-sm" className="text-secondary max-w-[52ch]">
            {t('notStarted.body')}
          </Text>
        </div>
        <div className="journey-mascot-well">
          <Mascot state="welcome" size={96} interactive />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {HIGHLIGHT_CONFIGS.map(({ Icon, titleKey, subKey, tone }) => (
          <div key={titleKey} className="journey-feature">
            <span className={`journey-feature-icon journey-feature-icon--${tone}`} aria-hidden="true">
              <Icon size={18} strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-[color:var(--text-heading)]">{t(titleKey)}</span>
              <span className="text-caption font-book text-muted">{t(subKey)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-start">
        <Button variant="primary" size="lg" className="rounded-pill" onClick={onStart}>
          {t('notStarted.cta')}
        </Button>
      </div>
    </Card>
  );
}
