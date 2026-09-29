import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Compass, Layers, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/shared/ui';
import type { StrengthBasis, StrengthCard } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainListCard, DomainEmptyState } from './DomainCardParts';

interface StrengthsDomainSectionProps {
  strengthCards: StrengthCard[];
}

// The icon and badge tone say how a card is grounded (PRO-432): tasks the
// student did, their own self-description, several tests agreeing, or an
// interest still to be checked. A hand-written card has no basis.
const BASIS_ICON: Record<StrengthBasis, LucideIcon> = {
  task_result: ClipboardCheck,
  self_report: UserRound,
  cross_signal: Layers,
  interest: Compass,
};

const BASIS_BADGE: Record<StrengthBasis, BadgeVariant> = {
  task_result: 'success',
  self_report: 'default',
  cross_signal: 'brand',
  interest: 'accent',
};

// 0–6 cards: fewer when fewer results honestly support one — the backend
// never pads the list, so an empty section is a real outcome, not "loading".
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
            <StrengthItem key={i} card={card} />
          ))}
        </div>
      )}
    </DomainCardFrame>
  );
}

const StrengthItem = memo(function StrengthItem({ card }: { card: StrengthCard }) {
  const { t } = useTranslation('results');
  const Icon = card.basis ? BASIS_ICON[card.basis] : Sparkles;
  return (
    <DomainListCard
      icon={<Icon size={22} strokeWidth={1.75} className="text-primary flex-shrink-0" aria-hidden="true" />}
      title={card.title}
      description={card.description}
      badge={card.basis && card.source_label ? <Badge variant={BASIS_BADGE[card.basis]}>{card.source_label}</Badge> : undefined}
    >
      {card.try_now && (
        <p className="text-caption leading-snug mt-2" style={{ color: 'var(--ink)' }}>
          <span className="font-semibold">{t('strengths.tryNowLabel')} </span>
          {card.try_now}
        </p>
      )}
    </DomainListCard>
  );
});
