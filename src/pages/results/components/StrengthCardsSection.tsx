import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { StrengthCard } from '@/shared/types';

interface StrengthCardsSectionProps {
  cards: StrengthCard[];
}

// Variable length (typically 5-7, contract §4.3) — never a fixed count, and
// legitimately empty is possible, so this section simply doesn't render then.
export function StrengthCardsSection({ cards }: StrengthCardsSectionProps) {
  const { t } = useTranslation('results');
  if (cards.length === 0) return null;

  return (
    <section aria-label={t('legacy.strengthsTitle')}>
      <SectionHeading emoji="💪" title={t('legacy.strengthsTitle')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <Card key={i} className="flex flex-col gap-1.5">
            <p className="font-extrabold text-primary" style={{ fontSize: 15 }}>{card.title}</p>
            <p className="text-caption text-secondary leading-snug">{card.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
