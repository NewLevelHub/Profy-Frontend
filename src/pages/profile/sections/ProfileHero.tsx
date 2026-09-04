import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { type as typeClass } from '@/shared/ui/typography/tokens';

export interface ProfileHeroProps {
  isJunior: boolean;
  displayName: string;
  age?: number;
  grade?: number;
}

/**
 * Identity header — one shared visual system for every age (Fog-bordered card,
 * mono meta line, display headline, welcome Mascot), only the composition
 * differs: junior gets "«МОИ ШТУКИ»" framing at 88px Mascot, senior/full
 * account gets the age/grade meta line at 54px. `TopRail` already renders
 * "Профиль" as the active nav tab — this card is page content, not chrome.
 *
 * The senior meta line omits a "· С {месяц} {год}" join-date clause the design
 * spec calls for — `User` (the self-facing auth type) has no `created_at`
 * field anywhere in the API contract (only the admin-only `AdminUserDetail`
 * does), so there's no real data to show there. Noted as a gap, not faked.
 */
export function ProfileHero({ isJunior, displayName, age, grade }: ProfileHeroProps) {
  const { t } = useTranslation('profile');
  if (isJunior) {
    return (
      <div
        className="rounded-[var(--radius)] border border-default p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="flex-1 order-2 sm:order-1">
          <p className={`${typeClass.monoLabel} text-muted mb-2`}>
            /profile{age ? ` · ${t('meta.ageYearsUpper', { count: age })}` : ''} · {t('hero.juniorKicker')}
          </p>
          <Heading level="display-lg" as="p" className="text-primary">
            {displayName}{age ? `, ${t('common:ageYears', { count: age })}` : ''}
          </Heading>
        </div>
        <div className="order-1 sm:order-2 flex-shrink-0 self-center">
          <Mascot state="welcome" size={88} interactive />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radius)] border border-default p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="flex-1 min-w-0 order-2 sm:order-1">
        <Heading level="display-md" as="p" className="text-primary">
          {displayName}
        </Heading>
        <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted mt-1.5">
          {[
            age ? t('meta.ageYearsUpper', { count: age }) : null,
            grade ? t('meta.gradeUpper', { count: grade }) : null,
          ].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="order-1 sm:order-2 flex-shrink-0 self-center sm:self-auto">
        <Mascot state="welcome" size={68} interactive />
      </div>
    </div>
  );
}
