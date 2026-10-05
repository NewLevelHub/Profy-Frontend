import type { ReactNode } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Brand } from './Brand';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import './redesign.css';
import './login.css';

export function LoginLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('auth');
  return (
    <div className="redesign rd-login-page">
      <a className="rd-skip" href="#login-content">{t('redesign.skip')}</a>
      <div className="rd-login-shell">
        <aside className="rd-login-story">
          <div className="rd-story-top"><Brand /><span>{t('redesign.space')}</span></div>
          <div className="rd-story-copy">
            <p className="rd-eyebrow">{t('redesign.eyebrow')}</p>
            <h2>{t('redesign.storyLine1')}<br />{t('redesign.storyLine2')}</h2>
            <p>{t('redesign.storyDescription')}</p>
          </div>
          <div className="rd-auth-art">
            <span className="rd-auth-orbit" aria-hidden="true" />
            <img src="/mascot/redesign/greeting.jpg" alt={t('redesign.mascotAlt')} width="800" height="900" />
            <span className="rd-auth-star" aria-hidden="true">✦</span>
            <div className="rd-auth-sticker"><Sparkles aria-hidden="true" /><p>{t('redesign.stickerLine1')}<strong>{t('redesign.stickerLine2')}</strong></p></div>
          </div>
          <p className="rd-story-footer">{t('redesign.storyFooter')}</p>
        </aside>
        <div className="rd-login-panel">
          <header className="rd-login-top">
            <div className="rd-mobile-brand"><Brand /></div>
            <Link to="/" className="rd-text-link rd-login-back"><ArrowLeft size={17} aria-hidden="true" />{t('redesign.back')}</Link>
            <div className="rd-preferences"><LanguageSwitcher /><ThemeToggle /></div>
          </header>
          <main className="rd-login-form" id="login-content" tabIndex={-1}>{children}</main>
          <p className="rd-login-note"><ShieldCheck size={16} aria-hidden="true" />{t('redesign.note')}</p>
        </div>
      </div>
    </div>
  );
}
