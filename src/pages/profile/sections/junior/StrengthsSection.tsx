import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import type { StrengthCard } from '@/shared/types';

export interface StrengthsSectionProps {
  cards: StrengthCard[];
}

/**
 * "ТВОИ СИЛЬНЫЕ СТОРОНЫ" — real data (`ResultResponse.strength_cards`), read
 * passively from the result store rather than fetched here (generating a
 * report as a side effect of viewing /profile would be a business-logic
 * change, not a visual one — that belongs to /results). No RIASEC type is
 * attached to a `StrengthCard`, so this uses a generic icon for every row
 * rather than force a `RiasecIcon` mapping the data doesn't support.
 */
export function StrengthsSection({ cards }: StrengthsSectionProps) {
  const { t } = useTranslation('profile');
  return (
    <div>
      <p className="font-mono text-tiny font-bold uppercase tracking-label text-muted mb-3">
        {t('strengths.kicker')}
      </p>

      {cards.length === 0 ? (
        <Card className="bg-transparent">
          <p className="text-body text-secondary">
            {t('strengths.empty')}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cards.map((card, i) => (
            <Card key={i} className="flex items-center gap-3 py-3.5 bg-transparent">
              <span
                className="flex-shrink-0 w-9 h-9 rounded-full grid place-items-center"
                style={{ background: 'var(--brand-subtle)', color: 'var(--pine)' }}
                aria-hidden="true"
              >
                <Sparkles size={16} />
              </span>
              <span className="text-body font-medium" style={{ color: 'var(--midnight)', fontSize: 16 }}>
                {card.title}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
