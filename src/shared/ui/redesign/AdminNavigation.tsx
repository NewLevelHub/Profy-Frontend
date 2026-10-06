import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Building2, ClipboardList, Compass, Heart, Layers3, LogOut, Menu, MessageSquare, ShieldCheck, Users, UsersRound, X } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { useAdminLocaleGuardState } from '@/shared/lib/useAdminLocaleGuard';

const groups = [
  { label: 'nav.title', items: [
    { path: '/admin/users', label: 'nav.users', icon: Users },
    { path: '/admin/universities', label: 'nav.universities', icon: Building2 },
    { path: '/admin/feedback', label: 'nav.feedback', icon: MessageSquare },
  ] },
  { label: 'nav.contentGroup', items: [
    { path: '/admin/content/questions', label: 'nav.questions', icon: BookOpen },
    { path: '/admin/content/question-pairs', label: 'nav.questionPairs', icon: Layers3 },
    { path: '/admin/content/motivation-statements', label: 'nav.motivationStatements', icon: Heart },
    { path: '/admin/content/directions', label: 'nav.directions', icon: Compass },
    { path: '/admin/content/belbin', label: 'nav.belbin', icon: UsersRound },
    { path: '/admin/content/tests', label: 'nav.tests', icon: ClipboardList },
  ] },
];

interface AdminNavigationProps {
  activePath: string;
  email?: string;
  onLogout: () => void;
}

export function AdminNavigation({ activePath, email, onLogout }: AdminNavigationProps) {
  const { t } = useTranslation(['admin', 'common']);
  const localeBlocked = useAdminLocaleGuardState(s => s.blocked);
  const localeDisabledReason = localeBlocked ? t('common.switchLocaleDisabled') : undefined;
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Program detail belongs to the university catalog, including direct links.
  const sectionPath = activePath.startsWith('/admin/programs/') ? '/admin/universities' : activePath;
  const current = groups.flatMap(group => group.items).find(item => sectionPath === item.path || sectionPath.startsWith(`${item.path}/`));

  useEffect(() => { setOpen(false); }, [activePath]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const navigation = <nav aria-label={t('nav.aria')}>
    {groups.map(group => <div className="rd-admin-nav-group" key={group.label}>
      <p className="rd-admin-nav-label">{t(group.label)}</p>
      {group.items.map(item => <Link key={item.path} to={item.path} aria-current={current?.path === item.path ? 'page' : undefined} onClick={() => setOpen(false)}>
        <item.icon size={18} aria-hidden="true" /><span>{t(item.label)}</span>
      </Link>)}
    </div>)}
  </nav>;
  const account = <div className="rd-admin-account">
    <span className="rd-admin-account-icon" aria-hidden="true"><ShieldCheck size={18} /></span>
    <div><strong>{t('nav.role')}</strong><span title={email}>{email}</span></div>
    <button type="button" className="rd-icon-button" onClick={onLogout} aria-label={t('common:logout')} title={t('common:logout')}><LogOut size={18} /></button>
  </div>;

  return <>
    <aside className="rd-admin-sidebar">
      <Link to="/admin/users" className="rd-brand" aria-label="Profile">profile<span>.</span></Link>
      <p className="rd-admin-sidebar-caption">{t('nav.kicker')}</p>
      {navigation}
      {account}
    </aside>
    <header className="rd-admin-topbar" ref={headerRef}>
      <Link to="/admin/users" className="rd-brand rd-admin-mobile-brand" aria-label="Profile">profile<span>.</span></Link>
      <div className="rd-admin-location"><ShieldCheck size={17} aria-hidden="true" /><span>{t('nav.kicker')}</span><span aria-hidden="true">/</span><strong>{t(current?.label ?? 'nav.title')}</strong></div>
      <div className="rd-admin-preferences"><LanguageSwitcher disabledReason={localeDisabledReason} /><ThemeToggle /></div>
      <button ref={toggleRef} type="button" className="rd-icon-button rd-admin-menu-toggle" aria-expanded={open} aria-controls="admin-menu"
        aria-label={t(open ? 'common:redesign.closeMenu' : 'common:redesign.openMenu')} onClick={() => setOpen(value => !value)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && <div className="rd-admin-mobile-menu" id="admin-menu">
        {navigation}
        <div className="rd-admin-mobile-preferences"><LanguageSwitcher disabledReason={localeDisabledReason} /><ThemeToggle /></div>
        {account}
      </div>}
    </header>
  </>;
}
