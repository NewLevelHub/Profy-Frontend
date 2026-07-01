import { NavLink } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { env } from '@/shared/config/env';

const NAV_ITEMS = [
  { label: 'Главная', path: '/home', emoji: '🏠' },
  { label: 'Результаты', path: '/results', emoji: '📊' },
  { label: 'Профиль', path: '/profile', emoji: '👤' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none border-r border-default bg-sidebar h-full overflow-y-auto z-30" style={{ padding: '26px 18px' }}>
      {/* Logo */}
      <div className="font-black text-primary px-3 mb-[30px]" style={{ fontSize: 24 }}>
        {env.APP_NAME}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, path, emoji }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-[14px] py-3 rounded-[14px] font-bold transition-colors',
                isActive
                  ? 'bg-surface text-primary font-extrabold'
                  : 'text-secondary hover:bg-surface',
              )
            }
            style={({ isActive }) => isActive ? { boxShadow: '0 2px 8px rgba(30,27,75,.05)', fontSize: 15 } : { fontSize: 15 }}
          >
            <span aria-hidden="true">{emoji}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
