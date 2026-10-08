import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, LogOut, Menu, UsersRound, X } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { PSYCHOLOGIST_NAV_ITEMS, isNavActive } from '../navigation/navItems';

interface PsychologistNavigationProps {
  activePath: string;
  email?: string;
  reviewCount: number;
  onLogout: () => void;
}

export function PsychologistNavigation({ activePath, email, reviewCount, onLogout }: PsychologistNavigationProps) {
  const { t } = useTranslation(['psychologist', 'common']);
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [activePath]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  const items = PSYCHOLOGIST_NAV_ITEMS.map((item, index) => {
    const Icon = index === 0 ? ClipboardCheck : UsersRound;
    const active = isNavActive(item.matchPrefix, activePath, activePath === item.path || activePath.startsWith(`${item.path}/`));
    return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>
      <Icon size={19} aria-hidden="true" /><span>{t(item.label)}</span>
      {index === 0 && reviewCount > 0 && <span className="rd-psych-nav-count">{reviewCount}</span>}
    </Link>;
  });
  const account = <div className="rd-psych-account">
    <span className="rd-psych-account-icon" aria-hidden="true">{email?.[0]?.toUpperCase() ?? 'P'}</span>
    <div><strong>{t('nav.role')}</strong><span title={email}>{email}</span></div>
    <button type="button" className="rd-icon-button" onClick={onLogout} aria-label={t('common:logout')} title={t('common:logout')}><LogOut size={18} /></button>
  </div>;

  return <>
    <aside className="rd-psych-sidebar">
      <Link to="/psychologist/reviews" className="rd-brand" aria-label="Profile">profile<span>.</span></Link>
      <p className="rd-psych-sidebar-caption">{t('nav.cabinet')}</p>
      <nav aria-label={t('nav.cabinet')}>{items}</nav>
      {account}
    </aside>
    <header className="rd-psych-topbar">
      <Link to="/psychologist/reviews" className="rd-brand rd-psych-mobile-brand" aria-label="Profile">profile<span>.</span></Link>
      <span className="rd-psych-workspace-label">{t('nav.workspace')}</span>
      <div className="rd-psych-preferences"><LanguageSwitcher /><ThemeToggle /></div>
      <button type="button" className="rd-icon-button rd-psych-menu-toggle" aria-expanded={open} aria-controls="psychologist-menu"
        aria-label={t(open ? 'common:redesign.closeMenu' : 'common:redesign.openMenu')} onClick={() => setOpen(value => !value)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && <div className="rd-psych-mobile-menu" id="psychologist-menu">
        <nav aria-label={t('nav.cabinet')}>{items}</nav>
        <div className="rd-psych-mobile-preferences"><LanguageSwitcher /><ThemeToggle /></div>
        {account}
      </div>}
    </header>
  </>;
}
