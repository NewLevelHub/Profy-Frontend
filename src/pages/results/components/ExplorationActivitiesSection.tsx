import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface ExplorationActivitiesSectionProps {
  activities: string[];
  note: string;
}

// mi-only (contract §7) — always non-empty for junior, always [] for riasec.
export function ExplorationActivitiesSection({ activities, note }: ExplorationActivitiesSectionProps) {
  const { t } = useTranslation('results');
  if (activities.length === 0) return null;

  return (
    <section aria-label={t('exploration.aria')}>
      <SectionHeading emoji="🧪" title={t('exploration.title')} />
      <div className="flex flex-col gap-2.5">
        {activities.map((activity, i) => (
          <Card key={i} className="flex flex-row items-center gap-2.5">
            <span className="text-lg select-none flex-shrink-0" aria-hidden="true">✨</span>
            <p className="text-body font-semibold text-primary">{activity}</p>
          </Card>
        ))}
      </div>
      {note && <p className="text-caption text-secondary leading-snug mt-2.5">{note}</p>}
    </section>
  );
}
