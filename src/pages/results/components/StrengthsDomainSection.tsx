import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import type { StrengthCard } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainListCard, DomainEmptyState } from './DomainCardParts';

interface StrengthsDomainSectionProps {
  strengthCards: StrengthCard[];
}

// A completed assessment has five cards. The explanation is explicitly
// labelled so the conclusion never looks detached from the student's answers.
// One card per row (not a grid) — descriptions here run longer than a
// centered grid cell reads well for.
export function StrengthsDomainSection({ strengthCards }: StrengthsDomainSectionProps) {
  const { t } = useTranslation('results');
  return (
    <DomainCardFrame ariaLabel={t('strengths.aria')}>
      <DomainKicker>{t('strengths.kicker')}</DomainKicker>
      {strengthCards.length === 0 ? (
        <DomainEmptyState>{t('strengths.empty')}</DomainEmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {strengthCards.map((card, i) => (
            <StrengthItem key={i} card={card} whyLabel={t('strengths.whyLabel')} />
          ))}
        </div>
      )}
    </DomainCardFrame>
  );
}

const StrengthItem = memo(function StrengthItem({ card, whyLabel }: { card: StrengthCard; whyLabel: string }) {
  return (
    <DomainListCard
      icon={<Sparkles size={22} strokeWidth={1.75} className="text-primary flex-shrink-0" aria-hidden="true" />}
      title={card.title}
      description={card.description}
      descriptionLabel={card.is_test_grounded ? whyLabel : undefined}
    />
  );
});
