import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { NAV_ITEMS } from '../navigation/navItems';

interface StudentNavigationProps {
  persistLocale?: boolean;
  activePath: string;
  identity: string | null;
  onLogout: () => void;
  /** Preview can demonstrate navigation without opening real student pages. */
  onNavigate?: (path: string) => void;
}

export function StudentNavigation({ activePath, identity, onLogout, onNavigate, persistLocale = true }: StudentNavigationProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [activePath]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const navigate = (event: React.MouseEvent, path: string) => {
    setOpen(false);
    if (onNavigate) { event.preventDefault(); onNavigate(path); }
  };
  return <header className="rd-student-header">
    <div className="rd-student-header-row">
      <Link to="/results" className="rd-brand" onClick={event => navigate(event, '/results')} aria-label="Profile">profile<span>.</span></Link>
      <nav className="rd-student-nav" aria-label={t('redesign.studentNav')}>
        {NAV_ITEMS.map(item => <Link key={item.path} to={item.path}
          aria-current={activePath === item.path || activePath.startsWith(`${item.path}/`) ? 'page' : undefined}
          onClick={event => navigate(event, item.path)}>{t(item.label)}</Link>)}
      </nav>
      <div className="rd-student-preferences"><LanguageSwitcher persistToAccount={persistLocale} /><ThemeToggle />
        <button type="button" className="rd-icon-button" onClick={onLogout} aria-label={t('logout')} title={t('logout')}><LogOut size={18} /></button>
      </div>
      <button type="button" className="rd-icon-button rd-student-menu" aria-expanded={open} aria-controls="student-menu"
        aria-label={t(open ? 'redesign.closeMenu' : 'redesign.openMenu')} onClick={() => setOpen(value => !value)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
    </div>
    {open && <div id="student-menu" className="rd-student-mobile">
      {identity && <p>{identity}</p>}
      <nav aria-label={t('redesign.studentNav')}>{NAV_ITEMS.map(item => <Link key={item.path} to={item.path}
        aria-current={activePath === item.path || activePath.startsWith(`${item.path}/`) ? 'page' : undefined}
        onClick={event => navigate(event, item.path)}>{t(item.label)}</Link>)}</nav>
      <div><LanguageSwitcher persistToAccount={persistLocale} /><ThemeToggle /><button type="button" className="rd-icon-button" onClick={onLogout} aria-label={t('logout')}><LogOut size={18} /></button></div>
    </div>}
  </header>;
}
