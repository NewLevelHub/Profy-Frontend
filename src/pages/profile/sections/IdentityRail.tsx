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
  const meta = [age ? `${age} ЛЕТ` : null, grade ? `${grade} КЛАСС` : null, city].filter(Boolean).join(' · ');

  return (
    <div className="lg:border-r border-default bg-page lg:bg-surface px-5 py-6 sm:px-8 lg:p-8 flex flex-col gap-6 lg:gap-7">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3.5">
        <Mascot state="welcome" size={72} className="-scale-x-100" />
        <div className="min-w-0">
          <Heading level="display-sm" as="p" className="text-primary leading-tight truncate">
            {displayName}
          </Heading>
          {meta && (
            <Mono variant="xs" as="p" className="text-secondary mt-1">
              {meta}
            </Mono>
          )}
        </div>
      </div>

      {sections.length > 0 && (
        <nav aria-label="Разделы профиля" className="hidden lg:flex flex-col border-t border-default">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center justify-between py-2.5 border-b border-[color:var(--border-faint)] text-body-sm font-medium text-primary hover:text-brand transition-colors"
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
