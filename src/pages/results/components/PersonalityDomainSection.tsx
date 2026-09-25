import { useTranslation } from 'react-i18next';
import type { StudentPersonalityNote } from '@/shared/types';
import { DomainCardFrame, DomainKicker, DomainGrid, DomainCell, LEVEL_STATUS_LABEL } from './DomainCardParts';

interface PersonalityDomainSectionProps {
  personalityNotes: StudentPersonalityNote[];
  personalityNote: string;
}

// Same status vocabulary as InterestDomainSection, but "high" reads as a
// trait strength rather than a type name — "СИЛЬНАЯ СТОРОНА" over the
// shared "ВЕДУЩИЙ". Values are i18n keys, resolved with `t()` at render.
// Exported because the printable/PDF version of the report (print/) has to
// label the same traits the same way (and localize them the same way).
export const PERSONALITY_STATUS_LABEL: Record<StudentPersonalityNote['level'], string> = {
  ...LEVEL_STATUS_LABEL,
  high: 'results:personalityDomain.statusHigh',
};

// Historical assessments with a complete Big Five response contain exactly
// five items. New assessments do not run Big Five and return an empty list;
// in that case the retired section must be absent rather than an empty card.
export function PersonalityDomainSection({ personalityNotes, personalityNote }: PersonalityDomainSectionProps) {
  const { t } = useTranslation('results');
  if (personalityNotes.length === 0) return null;

  return (
    <DomainCardFrame ariaLabel={t('personalityDomain.aria')}>
      <div>
        <DomainKicker>{t('personalityDomain.kicker')}</DomainKicker>
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
            status={t(PERSONALITY_STATUS_LABEL[n.level])}
            level={n.level}
          />
        ))}
      </DomainGrid>
    </DomainCardFrame>
  );
}
