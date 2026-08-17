import { NavLink, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { playClick } from '@/shared/lib/sounds';
import { useAuthStore } from '@/shared/store/auth';

const NAV_ITEMS = [
  { label: 'Главная', path: '/home', emoji: '🏠' },
  { label: 'Результаты', path: '/results', emoji: '📊' },
  { label: 'Профиль', path: '/profile', emoji: '👤' },
] as const;

const ADMIN_NAV_ITEMS = [
  { label: 'Пользователи', path: '/admin/users', emoji: '👥', matchPrefix: '/admin/users' },
  { label: 'Университеты', path: '/admin/universities', emoji: '🏫', matchPrefix: '/admin/universities' },
] as const;

type SidebarNavItem = (typeof NAV_ITEMS)[number] | (typeof ADMIN_NAV_ITEMS)[number];

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
  const location = useLocation();
  const navItems: SidebarNavItem[] = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : [...NAV_ITEMS];

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none border-r border-default bg-sidebar h-full overflow-y-auto z-30" style={{ padding: '26px 18px' }}>
      {/* Logo */}
      <div className="font-black text-primary px-3 mb-[30px]" style={{ fontSize: 24 }}>
        {env.APP_NAME}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, path, emoji, ...rest }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => playClick()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-[14px] py-3 rounded-[14px] font-bold transition-colors',
                isNavActive('matchPrefix' in rest ? rest.matchPrefix : undefined, location.pathname, isActive)
                  ? 'bg-surface text-primary font-extrabold'
                  : 'text-secondary hover:bg-surface',
              )
            }
            style={({ isActive }) =>
              isNavActive('matchPrefix' in rest ? rest.matchPrefix : undefined, location.pathname, isActive)
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
