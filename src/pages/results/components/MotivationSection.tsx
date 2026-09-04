import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';

interface MotivationSectionProps {
  highlights: string[];
}

export function MotivationSection({ highlights }: MotivationSectionProps) {
  const { t } = useTranslation('results');
  if (highlights.length === 0) return null;

  return (
    <section aria-label={t('legacy.motivationTitle')}>
      <SectionHeading emoji="🔥" title={t('legacy.motivationTitle')} />
      <div className="flex flex-col gap-2.5">
        {highlights.map((phrase, i) => (
          <Card key={i} className="flex flex-row items-center gap-2.5">
            <span className="text-lg select-none flex-shrink-0" aria-hidden="true">🔥</span>
            <p className="text-body font-semibold text-primary">{phrase}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
