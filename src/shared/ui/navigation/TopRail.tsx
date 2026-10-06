import { StudentNavigation } from '../redesign/StudentNavigation';
import { PsychologistNavigation } from '../redesign/PsychologistNavigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { homePathForUser } from '@/shared/lib/homePath';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { LOCALE_SWITCH_ENABLED } from '@/shared/store/locale';
import { playClick } from '@/shared/lib/sounds';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfileStore } from '@/shared/store/profile';
import { usePsychologistReviews } from '@/shared/hooks/usePsychologistReviews';
import { Mono, Text } from '@/shared/ui/typography';
import { NAV_ITEMS, ADMIN_NAV_ITEM, PSYCHOLOGIST_NAV_ITEMS, isNavActive, type NavItem } from './navItems';

// TopRail replaces the old two-piece nav shell (a desktop-only left
// <Sidebar> + a separate mobile-only top <Header> with its own duplicated
// item list). It is the single nav implementation used at every viewport —
// full inline nav row on md+ screens, a hamburger dropdown below that —
// backed by one shared NAV_ITEMS source (./navItems.ts).
export function TopRail({ redesigned = false, psychologist = false }: { redesigned?: boolean; psychologist?: boolean }) {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const profile = useProfileStore((s) => s.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Staff never see student tabs (Results → start test, etc.) — same as psychologist.
  const navItems: NavItem[] =
    user?.role === 'psychologist'
      ? [...PSYCHOLOGIST_NAV_ITEMS]
      : user?.is_admin || user?.role === 'admin'
        ? [ADMIN_NAV_ITEM]
        : [...NAV_ITEMS];

  const homePath = homePathForUser(user);
  const isPsychologist = user?.role === 'psychologist';
  const { data: reviews } = usePsychologistReviews({ enabled: isPsychologist });
  const counterFor = (item: NavItem): number | null =>
    'counter' in item && item.counter === 'psychologistReviews' && reviews?.length ? reviews.length : null;

  const activeFor = (item: NavItem) => isNavActive(
    'matchPrefix' in item ? item.matchPrefix : undefined,
    location.pathname,
    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  );

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const identity = profile
    ? `${profile.name} · ${t('ageYears', { count: profile.age })}`
    : null;

  if (psychologist) return <PsychologistNavigation activePath={location.pathname} email={user?.email} reviewCount={reviews?.length ?? 0} onLogout={handleLogout} />;
  if (redesigned) return <StudentNavigation activePath={location.pathname} identity={identity} onLogout={handleLogout} />;

  return (
    <header className="sticky top-0 z-40 flex-none app-chrome">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
        style={{ height: 'var(--header-h)' }}
      >
        <div className="flex items-baseline gap-3.5 flex-shrink-0">
          <Link
            to={homePath}
            className="brand-wordmark flex-shrink-0 hover:opacity-80 transition-opacity press-scale"
            aria-label={env.APP_NAME}
          >
            {env.APP_NAME}
            <span className="brand-dot" aria-hidden="true">.</span>
          </Link>
          {isPsychologist && (
            <Text as="span" variant="caption" className="hidden lg:inline text-muted">
              {t('psychologist:nav.cabinet')}
            </Text>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const on = activeFor(item);
            const count = counterFor(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={on ? 'page' : undefined}
                onClick={() => playClick()}
                className={cn(
                  'relative px-3 py-1.5 rounded-[10px] text-sm font-bold transition-[color,background-color] press-scale',
                  on
                    ? 'text-nav-active bg-[color:var(--bg-nav-active,var(--brand-subtle))]'
                    : 'text-nav hover:text-primary hover:bg-hover',
                )}
              >
                {t(item.label)}
                {count !== null && (
                  <Mono variant="sm" className="ml-1.5 text-[color:var(--dawn-deep)]">{count}</Mono>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-[color:var(--nav-active-border)] transition-opacity duration-200',
                    on ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Link>
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
            <Link
              key={item.path}
              to={item.path}
              aria-current={activeFor(item) ? 'page' : undefined}
              onClick={() => {
                playClick();
                setMobileOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors press-scale',
                activeFor(item)
                  ? 'bg-nav-active text-nav-active'
                  : 'text-nav hover:bg-nav-hover hover:text-primary',
              )}
            >
              {t(item.label)}
              {counterFor(item) !== null && (
                <Mono variant="sm" className="text-[color:var(--dawn-deep)]">
                  {counterFor(item)}
                </Mono>
              )}
            </Link>
          ))}
          {LOCALE_SWITCH_ENABLED && (
            <div className="px-3 py-2.5">
              <LanguageSwitcher />
            </div>
          )}
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
