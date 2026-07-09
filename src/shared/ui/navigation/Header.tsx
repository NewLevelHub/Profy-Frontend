import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { playClick } from '@/shared/lib/sounds';

const NAV_ITEMS = [
  { label: 'Главная', path: '/home' },
  { label: 'Результаты', path: '/results' },
  { label: 'Профиль', path: '/profile' },
] as const;

const ADMIN_NAV_ITEM = { label: 'Админка', path: '/admin/users', matchPrefix: '/admin' } as const;

type HeaderNavItem = (typeof NAV_ITEMS)[number] | typeof ADMIN_NAV_ITEM;

function isNavActive(
  matchPrefix: string | undefined,
  pathname: string,
  isActive: boolean,
) {
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return isActive;
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: HeaderNavItem[] = user?.is_admin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : [...NAV_ITEMS];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'P';

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="font-black text-lg tracking-tight text-primary">{env.APP_NAME}</span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => playClick()}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isNavActive('matchPrefix' in item ? item.matchPrefix : undefined, location.pathname, isActive)
                    ? 'bg-brand-subtle text-brand'
                    : 'text-secondary hover:bg-hover hover:text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand grid place-items-center flex-shrink-0">
            <span className="text-on-brand text-xs font-black">{initial}</span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-secondary hover:bg-hover transition-colors"
            title="Выйти"
          >
            <LogOut size={15} />
            <span>Выйти</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-hover text-secondary"
            aria-label="Меню"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-default bg-surface px-4 py-3 space-y-1">
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
                  'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isNavActive('matchPrefix' in item ? item.matchPrefix : undefined, location.pathname, isActive)
                    ? 'bg-brand-subtle text-brand'
                    : 'text-secondary hover:bg-hover hover:text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-hover"
          >
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
