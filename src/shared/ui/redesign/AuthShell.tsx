import type { ReactNode } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Brand } from './Brand';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import './redesign.css';
import './login.css';

export function AuthShell({ children, mode = 'login' }: { children: ReactNode; mode?: 'login' | 'register' | 'recovery' }) {
  const { t } = useTranslation('auth');
  const storyKey = mode === 'login' ? 'redesign' : `redesign.${mode}`;
  return (
    <div className="redesign rd-login-page">
      <a className="rd-skip" href="#auth-content">{t('redesign.skip')}</a>
      <div className="rd-login-shell">
        <aside className="rd-login-story">
          <div className="rd-story-top"><Brand /><span>{t('redesign.space')}</span></div>
          <div className="rd-story-copy">
            <p className="rd-eyebrow">{t('redesign.eyebrow')}</p>
            <h2>{t(`${storyKey}.storyLine1`)}<br />{t(`${storyKey}.storyLine2`)}</h2>
            <p>{t(`${storyKey}.storyDescription`)}</p>
          </div>
          <div className="rd-auth-art">
            <img src={`/mascot/redesign/${mode === 'register' ? 'book' : 'greeting'}.png`} alt={t(mode === 'register' ? 'redesign.register.mascotAlt' : 'redesign.mascotAlt')} width="1254" height="1254" />
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
          <main className="rd-login-form" id="auth-content" tabIndex={-1}>{children}</main>
          <p className="rd-login-note"><ShieldCheck size={16} aria-hidden="true" />{t('redesign.note')}</p>
        </div>
      </div>
    </div>
  );
}
