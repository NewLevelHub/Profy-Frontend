import { Sparkles, Layers, Users } from 'lucide-react';
import type { StrengthCard } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainListCard, DomainEmptyState } from './DomainCardParts';

interface StrengthsDomainSectionProps {
  strengthCards: StrengthCard[];
}

// Decorative only — StrengthCard carries no category to map an icon to
// meaningfully, so this just cycles for visual variety between cards, not
// as a signal of what kind of strength each one is.
const STRENGTH_ICONS = [Sparkles, Layers, Users];

// Variable length (typically 5-7, contract §4.3) — legitimately empty is
// possible, hence the empty-state message rather than hiding the section.
// One card per row (not a grid) — descriptions here run longer than a
// centered grid cell reads well for.
export function StrengthsDomainSection({ strengthCards }: StrengthsDomainSectionProps) {
  return (
    <DomainCardFrame ariaLabel="Сильные стороны">
      <DomainKicker>СИЛЬНЫЕ СТОРОНЫ</DomainKicker>
      {strengthCards.length === 0 ? (
        <DomainEmptyState>Появится по мере новых ответов.</DomainEmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {strengthCards.map((card, i) => {
            const Icon = STRENGTH_ICONS[i % STRENGTH_ICONS.length];
            return (
              <DomainListCard
                key={i}
                icon={<Icon size={22} strokeWidth={1.75} className="text-primary flex-shrink-0" aria-hidden="true" />}
                title={card.title}
                description={card.description}
              />
            );
          })}
        </div>
      )}
    </DomainCardFrame>
  );
}
