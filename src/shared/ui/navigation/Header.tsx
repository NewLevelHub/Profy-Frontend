import { LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import {
  getInitials,
  isNavItemActive,
  MAIN_NAV_ITEMS,
  resolveNavPath,
} from './navConfig';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = useAuthStore((s) => s.user?.is_admin);
  const profile = useProfileStore((s) => s.profile);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const directionSlug = useResultStore((s) => s.report?.direction_slug);

  const navItems = MAIN_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const testPath = assessmentId && goal ? '/assessment' : '/assessment/goal';

  const displayName = profile?.name?.trim() || user?.name?.trim() || 'Пользователь';
  const initials = getInitials(displayName);
  const profileMeta = profile
    ? `${profile.grade} класс · ${profile.city}`
    : null;

  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function handleLogout() {
    setDrawerOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-default">
        <div className="relative h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-[12px] border border-default bg-surface grid place-items-center text-secondary hover:bg-hover transition-colors"
            aria-label="Меню"
          >
            <Menu size={18} />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 pointer-events-none">
            <div
              className="w-8 h-8 rounded-[10px] bg-brand grid place-items-center flex-none"
              aria-hidden="true"
            >
              <span className="text-on-brand font-black text-sm leading-none">P</span>
            </div>
            <span className="font-black text-lg tracking-tight text-primary">Profy</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-brand grid place-items-center flex-shrink-0"
            aria-label="Профиль"
          >
            <span className="text-on-brand text-xs font-black">{initials}</span>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside
            className="relative flex flex-col w-[280px] max-w-[85vw] bg-surface h-full shadow-pop animate-[slideInLeft_200ms_ease-out]"
            style={{ padding: '26px 18px' }}
          >
            {/* Logo + close */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 px-1">
                <div
                  className="w-9 h-9 rounded-[12px] bg-brand grid place-items-center flex-none"
                  aria-hidden="true"
                >
                  <span className="text-on-brand font-black text-lg leading-none">P</span>
                </div>
                <span className="font-black text-primary text-2xl tracking-tight">Profy</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-[10px] border border-default bg-surface grid place-items-center text-secondary hover:bg-hover transition-colors"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto">
              {navItems.map((item) => {
                const to = resolveNavPath(item, { testPath, directionSlug });
                const active = isNavItemActive(item, location.pathname);

                return (
                  <NavLink
                    key={item.id}
                    to={to}
                    onClick={() => {
                      playClick();
                      setDrawerOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-[14px] py-3 rounded-[14px] font-bold text-[15px] transition-colors',
                      active
                        ? 'bg-brand-subtle text-brand border border-brand font-extrabold'
                        : 'text-secondary border border-transparent hover:bg-brand-subtle/60',
                    )}
                  >
                    <span aria-hidden="true" className="text-[18px] leading-none">
                      {item.emoji}
                    </span>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* User card */}
            <div
              className="mt-6 rounded-[16px] bg-brand-subtle border border-default p-3 flex items-center gap-3 cursor-pointer hover:bg-brand-subtle/80 transition-colors"
              onClick={() => { playClick(); setDrawerOpen(false); navigate('/profile'); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDrawerOpen(false); navigate('/profile'); } }}
            >
              <div className="w-10 h-10 rounded-full bg-brand grid place-items-center flex-none">
                <span className="text-on-brand text-sm font-black">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-primary text-[15px] truncate">
                  {displayName.split(/\s+/)[0]}
                </div>
                {profileMeta && (
                  <div className="text-muted text-[13px] font-semibold truncate">
                    {profileMeta}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="w-9 h-9 rounded-[10px] bg-surface border border-default grid place-items-center text-secondary hover:text-primary hover:border-strong transition-colors flex-none"
                title="Выйти"
                aria-label="Выйти"
              >
                <LogOut size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
