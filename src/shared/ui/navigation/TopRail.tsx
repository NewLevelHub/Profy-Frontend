import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { playClick } from '@/shared/lib/sounds';
import { useAuth } from '@/shared/hooks/useAuth';
import { NAV_ITEMS, ADMIN_NAV_ITEM, isNavActive, type NavItem } from './navItems';

// TopRail replaces the old two-piece nav shell (a desktop-only left
// <Sidebar> + a separate mobile-only top <Header> with its own duplicated
// item list). It is the single nav implementation used at every viewport —
// full inline nav row on md+ screens, a hamburger dropdown below that —
// backed by one shared NAV_ITEMS source (./navItems.ts).
export function TopRail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: NavItem[] = user?.is_admin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : [...NAV_ITEMS];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'P';

  return (
    <header className="sticky top-0 z-40 flex-none bg-surface border-b border-default">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
        style={{ height: 'var(--header-h)' }}
      >
        {/* Logo */}
        <span className="font-black text-lg tracking-tight text-primary flex-shrink-0">
          {env.APP_NAME}
        </span>

        {/* Nav — inline on md+, collapses into the dropdown below md */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => playClick()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors',
                  isNavActive('matchPrefix' in item ? item.matchPrefix : undefined, location.pathname, isActive)
                    ? 'bg-nav-active text-nav-active'
                    : 'text-nav hover:bg-nav-hover hover:text-primary',
                )
              }
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
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
            aria-expanded={mobileOpen}
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
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors',
                  isNavActive('matchPrefix' in item ? item.matchPrefix : undefined, location.pathname, isActive)
                    ? 'bg-nav-active text-nav-active'
                    : 'text-nav hover:bg-nav-hover hover:text-primary',
                )
              }
            >
              <span aria-hidden="true">{item.emoji}</span>
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
