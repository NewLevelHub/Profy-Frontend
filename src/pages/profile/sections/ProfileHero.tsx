import { Mascot } from '@/shared/ui/Mascot';

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
  if (isJunior) {
    return (
      <div
        className="rounded-[var(--radius)] border border-default p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="flex-1 order-2 sm:order-1">
          <p className="font-mono text-tiny font-bold uppercase tracking-[.06em] text-muted mb-2">
            /profile{age ? ` · ${age} ЛЕТ` : ''} · «МОИ ШТУКИ»
          </p>
          <p
            className="font-display text-primary"
            style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            {displayName}{age ? `, ${age} лет` : ''}
          </p>
        </div>
        <div className="order-1 sm:order-2 flex-shrink-0 self-center">
          <Mascot state="welcome" size={88} />
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
        <p
          className="font-display text-primary"
          style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}
        >
          {displayName}
        </p>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[.06em] text-muted mt-1.5">
          {[age ? `${age} ЛЕТ` : null, grade ? `${grade} КЛАСС` : null].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="order-1 sm:order-2 flex-shrink-0 self-center sm:self-auto">
        <Mascot state="welcome" size={54} />
      </div>
    </div>
  );
}
