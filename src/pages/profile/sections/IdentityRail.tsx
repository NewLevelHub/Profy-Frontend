import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Mono } from '@/shared/ui/typography/Mono';

export interface IdentityRailSection {
  id: string;
  number: string;
  label: string;
  /** Overrides the number badge when a section still needs attention (e.g. "—" for empty certificates) */
  status?: string;
}

export interface IdentityRailProps {
  displayName: string;
  age?: number;
  grade?: number;
  city?: string;
  sections: IdentityRailSection[];
}

// Left identity rail on lg+ (avatar, name, meta, jump-to-section nav);
// collapses to a plain header block on narrower screens — the section nav
// only earns its keep once there's a second column to anchor against.
export function IdentityRail({ displayName, age, grade, city, sections }: IdentityRailProps) {
  const { t } = useTranslation('profile');
  const meta = [
    age ? t('meta.ageYearsUpper', { count: age }) : null,
    grade ? t('meta.gradeUpper', { count: grade }) : null,
    city,
  ].filter(Boolean).join(' · ');

  return (
    <div className="identity-rail lg:border-r border-[color:color-mix(in_srgb,var(--border)_65%,transparent)] px-5 py-6 sm:px-8 lg:p-8 flex flex-col gap-6 lg:gap-7">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-4">
        <div className="journey-mascot-well !w-[88px] !h-[88px]">
          <Mascot state="welcome" size={72} className="-scale-x-100" />
        </div>
        <div className="min-w-0">
          <Heading level="display-sm" as="p" className="text-[color:var(--text-heading)] leading-tight truncate">
            {displayName}
          </Heading>
          {meta && (
            <Mono variant="xs" as="p" className="text-secondary mt-1.5">
              {meta}
            </Mono>
          )}
        </div>
      </div>

      {sections.length > 0 && (
        <nav aria-label={t('identityRail.sectionsAria')} className="hidden lg:flex flex-col gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="field-tile flex items-center justify-between px-3.5 py-2.5 text-body-sm font-medium text-primary hover:text-brand transition-colors"
            >
              <span>{s.label}</span>
              <Mono variant="xs" className={s.status ? 'text-accent' : 'text-secondary'}>
                {s.status ?? s.number}
              </Mono>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
