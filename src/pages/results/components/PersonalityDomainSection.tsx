import type { StudentPersonalityNote } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainGrid, DomainCell } from './DomainCardParts';

interface PersonalityDomainSectionProps {
  personalityNotes: StudentPersonalityNote[];
  personalityNote: string;
}

// Always exactly 5 items, one per Big Five domain (contract §4.3a), for
// every instrument — junior answers Big Five pair-cards mixed with MI
// Likert questions (see useGoalSelection.ts), so this section is never
// junior-gated. Unlike interest_map, personality has no level/ranking
// field, so no cell here gets a status word or the isLeading tint — all 5
// traits render as visually equal.
export function PersonalityDomainSection({ personalityNotes, personalityNote }: PersonalityDomainSectionProps) {
  return (
    <DomainCardFrame ariaLabel="Личностный профиль">
      <div>
        <DomainKicker>ЛИЧНОСТНЫЙ ПРОФИЛЬ</DomainKicker>
        {personalityNote && (
          <p className="text-body text-primary leading-relaxed">{personalityNote}</p>
        )}
      </div>
      <DomainGrid columnsClassName="grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
        {personalityNotes.map((n) => (
          <DomainCell key={n.trait} title={n.label} description={n.description} />
        ))}
      </DomainGrid>
    </DomainCardFrame>
  );
}
