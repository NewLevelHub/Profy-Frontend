import { NavLink, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { playClick } from '@/shared/lib/sounds';
import { useAuthStore } from '@/shared/store/auth';
import { useResultStore } from '@/shared/store/result';

interface SidebarNavItem {
  label: string;
  path: string;
  emoji: string;
  matchPrefix?: string;
}

const NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Главная', path: '/home', emoji: '🏠' },
  { label: 'Результаты', path: '/results', emoji: '📊' },
  { label: 'Профиль', path: '/profile', emoji: '👤' },
];

const ADMIN_NAV_ITEM: SidebarNavItem = { label: 'Админка', path: '/admin/users', emoji: '⚙️', matchPrefix: '/admin' };

function isNavActive(
  matchPrefix: string | undefined,
  pathname: string,
  isActive: boolean,
) {
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return isActive;
}

export function Sidebar() {
  const isAdmin = useAuthStore((s) => s.user?.is_admin);
  // Populated once the student has viewed /results at least once this session
  // (same slug ResultsPage uses to link to the universities list) — omit the
  // item entirely until then rather than linking to a dead route.
  const directionSlug = useResultStore((s) => s.report?.direction_slug);
  const location = useLocation();

  const navItems: SidebarNavItem[] = [...NAV_ITEMS];
  if (directionSlug) {
    const universitiesPath = `/results/directions/${encodeURIComponent(directionSlug)}/universities`;
    navItems.splice(2, 0, {
      label: 'Университеты',
      path: universitiesPath,
      emoji: '🎓',
      matchPrefix: universitiesPath,
    });
  }
  if (isAdmin) navItems.push(ADMIN_NAV_ITEM);

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none border-r border-default bg-sidebar h-full overflow-y-auto z-30" style={{ padding: '26px 18px' }}>
      {/* Logo */}
      <div className="font-black text-primary px-3 mb-[30px]" style={{ fontSize: 24 }}>
        {env.APP_NAME}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, path, emoji, matchPrefix }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => playClick()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-[14px] py-3 rounded-[14px] font-bold transition-colors',
                isNavActive(matchPrefix, location.pathname, isActive)
                  ? 'bg-surface text-primary font-extrabold'
                  : 'text-secondary hover:bg-surface',
              )
            }
            style={({ isActive }) =>
              isNavActive(matchPrefix, location.pathname, isActive)
                ? { boxShadow: '0 2px 8px rgba(30,27,75,.05)', fontSize: 15 }
                : { fontSize: 15 }
            }
          >
            <span aria-hidden="true">{emoji}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
