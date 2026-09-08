import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { playClick } from '@/shared/lib/sounds';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfileStore } from '@/shared/store/profile';
import { NAV_ITEMS, ADMIN_NAV_ITEM, isNavActive, type NavItem } from './navItems';

// TopRail replaces the old two-piece nav shell (a desktop-only left
// <Sidebar> + a separate mobile-only top <Header> with its own duplicated
// item list). It is the single nav implementation used at every viewport —
// full inline nav row on md+ screens, a hamburger dropdown below that —
// backed by one shared NAV_ITEMS source (./navItems.ts).
export function TopRail() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const profile = useProfileStore((s) => s.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: NavItem[] = user?.is_admin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : [...NAV_ITEMS];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const identity = profile
    ? `${profile.name} · ${t('ageYears', { count: profile.age })}`
    : null;

  return (
    <header className="sticky top-0 z-40 flex-none app-chrome">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
        style={{ height: 'var(--header-h)' }}
      >
        <Link
          to="/results"
          className="brand-wordmark flex-shrink-0 hover:opacity-80 transition-opacity press-scale"
          aria-label={env.APP_NAME}
        >
          {env.APP_NAME}
          <span className="brand-dot" aria-hidden="true">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const active = isNavActive(
              'matchPrefix' in item ? item.matchPrefix : undefined,
              location.pathname,
              false,
            );
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => playClick()}
                className={({ isActive }) => {
                  const on = isNavActive(
                    'matchPrefix' in item ? item.matchPrefix : undefined,
                    location.pathname,
                    isActive,
                  );
                  return cn(
                    'relative px-3 py-1.5 rounded-[10px] text-sm font-bold transition-[color,background-color] press-scale',
                    on
                      ? 'text-nav-active bg-[color:var(--bg-nav-active,var(--brand-subtle))]'
                      : 'text-nav hover:text-primary hover:bg-hover',
                  );
                }}
              >
                {({ isActive }) => {
                  const on = isNavActive(
                    'matchPrefix' in item ? item.matchPrefix : undefined,
                    location.pathname,
                    isActive,
                  );
                  return (
                    <>
                      {t(item.label)}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-[color:var(--nav-active-border)] transition-opacity duration-200',
                          on ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <LanguageSwitcher className="hidden md:inline-flex" />

          {identity && (
            <span className="hidden sm:inline text-sm text-muted font-semibold">{identity}</span>
          )}

          <ThemeToggle className="hidden md:inline-flex" />

          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:bg-hover hover:text-primary transition-colors press-scale"
            aria-label={t('logout')}
            title={t('logout')}
          >
            <LogOut size={15} />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-hover text-secondary press-scale"
            aria-label={t('menu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-strong app-chrome px-4 py-3 space-y-1">
          {identity && (
            <p className="px-3 py-1.5 text-sm text-muted font-semibold">{identity}</p>
          )}
          <div className="px-3 py-1.5 flex items-center justify-between gap-3">
            <span className="text-sm text-muted font-semibold">{t('themeLabel')}</span>
            <ThemeToggle />
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                playClick();
                setMobileOpen(false);
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors press-scale',
                  isNavActive('matchPrefix' in item ? item.matchPrefix : undefined, location.pathname, isActive)
                    ? 'bg-nav-active text-nav-active'
                    : 'text-nav hover:bg-nav-hover hover:text-primary',
                )
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
          <div className="px-3 py-2.5">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-hover"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </header>
  );
}
