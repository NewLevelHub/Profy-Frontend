import type { ReactNode } from 'react';
import { ArrowLeft, Compass, KeyRound, Landmark, LayoutDashboard, Layers, ListChecks, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CATALOG_MILESTONES } from '@/shared/config/catalogMilestones';
import { ASSESSMENT_PHASE_MINUTES } from '@/shared/config/constants';
import { formatNumber } from '@/shared/i18n/format';
import { Brand } from './Brand';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import './redesign.css';
import './login.css';

const FACTS = [
  { key: 'tests', icon: ListChecks, tone: 'sage', value: Object.keys(ASSESSMENT_PHASE_MINUTES).length },
  { key: 'professions', icon: Compass, tone: 'peach', value: CATALOG_MILESTONES.careers },
  { key: 'universities', icon: Landmark, tone: 'lilac', value: CATALOG_MILESTONES.universities },
  { key: 'programs', icon: Layers, tone: 'sage', value: CATALOG_MILESTONES.programs },
] as const;

/** /invite is for psychologists and admins — the student pitch doesn't apply. */
const STAFF_FACTS = [
  { key: 'access', icon: ShieldCheck, tone: 'sage' },
  { key: 'signIn', icon: KeyRound, tone: 'peach' },
  { key: 'cabinet', icon: LayoutDashboard, tone: 'lilac' },
] as const;

export function AuthShell({ children, page }: {
  children: ReactNode;
  page: 'login' | 'register' | 'verifyEmail' | 'forgotPassword' | 'resetPassword' | 'invite';
}) {
  const { t } = useTranslation('auth');
  const storyKey = `layout.aside.${page}`;
  const isRegistration = page === 'register' || page === 'verifyEmail';
  // The invitee's account is made only from this page, and getting back to it
  // takes the emailed link — so nothing here leads away from it.
  const isInvite = page === 'invite';
  return (
    <div className="redesign rd-login-page">
      <a className="rd-skip" href="#auth-content">{t('redesign.skip')}</a>
      <div className="rd-login-shell">
        <aside className="rd-login-story">
          <div className="rd-story-top"><Brand linked={!isInvite} /><span>{t('redesign.space')}</span></div>
          <div className="rd-story-body" key={page}>
            <div className="rd-story-copy auth-enter">
              <h2>{t(`${storyKey}.head`)}{' '}<span>{t(`${storyKey}.accent`)}</span></h2>
              <p>{t(`${storyKey}.sub`)}</p>
            </div>
            <ul className="rd-auth-facts">
              {isInvite
                ? STAFF_FACTS.map(({ key, icon: Icon, tone }, index) => <li key={key} className={`rd-auth-fact auth-enter auth-enter-d${index + 1}`}>
                  <span className={`rd-icon-tile rd-${tone}`}><Icon aria-hidden="true" /></span>
                  <h3>{t(`layout.staff.${key}.title`)}</h3>
                  <p>{t(`layout.staff.${key}.desc`)}</p>
                </li>)
                : FACTS.map(({ key, icon: Icon, tone, value }, index) => <li key={key} className={`rd-auth-fact auth-enter auth-enter-d${index + 1}`}>
                  <span className={`rd-icon-tile rd-${tone}`}><Icon aria-hidden="true" /></span>
                  <h3>{t(`layout.stats.${key}.title`, { count: value, value: formatNumber(value) })}</h3>
                  <p>{t(`layout.stats.${key}.desc`)}</p>
                </li>)}
            </ul>
            {!isInvite && (
              <div className="rd-auth-companion auth-enter auth-enter-d5">
                <img src={`/mascot/redesign/${isRegistration ? 'book' : 'greeting'}.png`} alt="" width="1254" height="1254" />
                <div><p>{t('redesign.stickerLine1')}<strong>{t('redesign.stickerLine2')}</strong></p></div>
              </div>
            )}
          </div>
          <p className="rd-story-footer">{t(isInvite ? 'layout.staff.footer' : 'redesign.storyFooter')}</p>
        </aside>
        <div className="rd-login-panel">
          <header className="rd-login-top">
            <div className="rd-mobile-brand"><Brand linked={!isInvite} /></div>
            {!isInvite && <Link to="/" className="rd-text-link rd-login-back"><ArrowLeft size={17} aria-hidden="true" />{t('redesign.back')}</Link>}
            <div className="rd-preferences"><LanguageSwitcher /><ThemeToggle /></div>
          </header>
          <main key={page} className="rd-login-form auth-enter auth-enter-2" id="auth-content" tabIndex={-1}>{children}</main>
          <p className="rd-login-note"><ShieldCheck size={16} aria-hidden="true" />{t(isInvite ? 'layout.staff.note' : 'redesign.note')}</p>
        </div>
      </div>
    </div>
  );
}
