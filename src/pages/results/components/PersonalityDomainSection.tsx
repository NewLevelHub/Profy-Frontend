import type { StudentPersonalityNote } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainGrid, DomainCell, LEVEL_STATUS_LABEL } from './DomainCardParts';

interface PersonalityDomainSectionProps {
  personalityNotes: StudentPersonalityNote[];
  personalityNote: string;
}

// Same status vocabulary as InterestDomainSection, but "high" reads as a
// trait strength rather than a type name — "СИЛЬНАЯ СТОРОНА" over the
// shared "ВЕДУЩИЙ". Exported because the printable/PDF version of the
// report (print/) has to label the same traits the same way.
export const PERSONALITY_STATUS_LABEL: Record<StudentPersonalityNote['level'], string> = {
  ...LEVEL_STATUS_LABEL,
  high: 'СИЛЬНАЯ СТОРОНА',
};

// Always exactly 5 items, one per Big Five domain (contract §4.3a), for
// every instrument. `level` (same opaque low/medium/high enum as
// interest_map) was added to personality_notes too, so each cell now gets
// the same fill-contrast treatment as InterestDomainSection — solid Dawn
// fill + white text at `high`, unchanged neutral surface at `medium`,
// transparent + dimmed at `low`.
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
          <DomainCell
            key={n.trait}
            title={n.label}
            description={n.description}
            status={PERSONALITY_STATUS_LABEL[n.level]}
            level={n.level}
          />
        ))}
      </DomainGrid>
    </DomainCardFrame>
  );
}
