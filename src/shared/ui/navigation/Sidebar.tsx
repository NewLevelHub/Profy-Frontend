import { LogOut, Home, BarChart2, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';

const NAV_ITEMS = [
  { label: 'Главная', path: '/home', icon: Home },
  { label: 'Результаты', path: '/results', icon: BarChart2 },
  { label: 'Профиль', path: '/profile', icon: User },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'P';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none border-r border-default bg-sidebar h-full overflow-y-auto z-30">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center gap-2 border-b border-default flex-shrink-0">
        <span className="font-black text-lg tracking-tight text-primary">{env.APP_NAME}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-subtle text-brand'
                  : 'text-secondary hover:bg-hover hover:text-primary',
              )
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-4 border-t border-default flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-on-brand text-xs font-black">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-semibold text-primary truncate">{user?.name ?? 'Пользователь'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-secondary hover:bg-hover hover:text-primary transition-colors"
        >
          <LogOut size={16} className="flex-shrink-0" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
