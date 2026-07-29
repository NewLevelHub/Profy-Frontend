import { LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { useAuth } from '@/shared/hooks/useAuth';
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

function ProfyLogo() {
  return (
    <div className="flex items-center gap-3 px-3 mb-8">
      <div
        className="w-9 h-9 rounded-[12px] bg-brand grid place-items-center flex-none"
        aria-hidden="true"
      >
        <span className="text-on-brand font-black text-lg leading-none">P</span>
      </div>
      <span className="font-black text-primary text-2xl tracking-tight">Profy</span>
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isAdmin = useAuthStore((s) => s.user?.is_admin);
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const goal = useAssessmentStore((s) => s.goal);
  const directionSlug = useResultStore((s) => s.report?.direction_slug);

  const navItems = MAIN_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const testPath =
    assessmentId && goal ? '/assessment' : '/assessment/goal';

  const displayName =
    profile?.name?.trim() || user?.name?.trim() || 'Пользователь';
  const initials = getInitials(displayName);
  const profileMeta = profile
    ? `${profile.grade} класс · ${profile.city}`
    : null;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-[260px] flex-none border-r border-default bg-surface h-full z-30"
      style={{ padding: '26px 18px' }}
    >
      <ProfyLogo />

      <nav className="flex flex-col gap-1 flex-1 min-h-0">
        {navItems.map((item) => {
          const to = resolveNavPath(item, { testPath, directionSlug });
          const active = isNavItemActive(item, location.pathname);

          return (
            <NavLink
              key={item.id}
              to={to}
              onClick={() => playClick()}
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

      <div
        className="mt-6 rounded-[16px] bg-brand-subtle border border-default p-3 flex items-center gap-3 cursor-pointer hover:bg-brand-subtle/80 transition-colors"
        onClick={() => { playClick(); navigate('/profile'); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/profile'); } }}
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
  );
}
