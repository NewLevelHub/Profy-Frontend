import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';
import { playClick } from '@/shared/lib/sounds';

interface HeaderNavItem {
  label: string;
  path: string;
  emoji: string;
  matchPrefix?: string;
}

const NAV_ITEMS: HeaderNavItem[] = [
  { label: 'Главная', path: '/home', emoji: '🏠' },
  { label: 'Результаты', path: '/results', emoji: '📊' },
  { label: 'Профиль', path: '/profile', emoji: '👤' },
];

const ADMIN_NAV_ITEM: HeaderNavItem = { label: 'Админка', path: '/admin/users', emoji: '⚙️', matchPrefix: '/admin' };

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
  const [menuOpen, setMenuOpen] = useState(false);
  const directionSlug = useResultStore((s) => s.report?.direction_slug);
  const profile = useProfileStore((s) => s.profile);

  const navItems: HeaderNavItem[] = [...NAV_ITEMS];
  if (directionSlug) {
    const universitiesPath = `/results/directions/${encodeURIComponent(directionSlug)}/universities`;
    navItems.splice(2, 0, { label: 'Университеты', path: universitiesPath, emoji: '🎓', matchPrefix: universitiesPath });
  }
  if (user?.is_admin) navItems.push(ADMIN_NAV_ITEM);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  function closeAndNavigate() {
    playClick();
    setMenuOpen(false);
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'P';

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-surface border-b-2 border-[#EDE9FE]">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          className="w-[38px] h-[38px] flex-none rounded-xl border-2 border-[#DDD6FE] bg-surface text-brand grid place-items-center"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="w-[30px] h-[30px] flex-none rounded-[10px] bg-brand grid place-items-center text-on-brand font-black text-base">
            P
          </div>
          <span className="text-lg font-extrabold tracking-tight text-primary truncate">{env.APP_NAME}</span>
        </div>

        <NavLink
          to="/profile"
          onClick={() => playClick()}
          aria-label="Профиль"
          className="w-[38px] h-[38px] flex-none rounded-full bg-brand grid place-items-center"
        >
          <span className="text-on-brand text-xs font-black">{initial}</span>
        </NavLink>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[270px] flex-none bg-surface border-r-2 border-[#DDD6FE] p-3.5 flex flex-col gap-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between gap-2.5 px-1">
              <div className="flex items-center gap-2">
                <div className="w-[34px] h-[34px] flex-none rounded-[11px] bg-brand grid place-items-center text-on-brand font-black text-lg">
                  P
                </div>
                <span className="text-xl font-extrabold tracking-tight text-primary">{env.APP_NAME}</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
                className="w-[34px] h-[34px] flex-none rounded-[11px] border-2 border-[#DDD6FE] bg-surface text-secondary grid place-items-center"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeAndNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 min-h-[48px] px-3 rounded-2xl font-bold transition-colors',
                      isNavActive(item.matchPrefix, location.pathname, isActive)
                        ? 'bg-brand-subtle text-brand border-2 border-[#DDD6FE]'
                        : 'text-secondary border-2 border-transparent hover:bg-hover',
                    )
                  }
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto flex items-center gap-2 p-2 rounded-2xl bg-page">
              <NavLink
                to="/profile"
                onClick={closeAndNavigate}
                className="flex-1 min-w-0 flex items-center gap-2.5 p-1 rounded-xl transition-colors hover:bg-brand-subtle"
              >
                <div className="w-[38px] h-[38px] flex-none rounded-full bg-brand grid place-items-center text-on-brand font-black text-sm">
                  {initial}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-extrabold text-[15px] truncate">{user?.name || 'Профиль'}</div>
                  {profile && (
                    <div className="font-semibold text-xs text-secondary truncate">
                      {profile.grade} класс · {profile.city}
                    </div>
                  )}
                </div>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                title="Выйти"
                aria-label="Выйти"
                className="w-9 h-9 flex-none rounded-xl border-2 border-[#DDD6FE] bg-surface text-secondary grid place-items-center transition-colors hover:bg-danger-subtle hover:text-danger"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
            className="flex-1 border-none bg-black/35 cursor-pointer"
          />
        </div>
      )}
    </header>
  );
}
