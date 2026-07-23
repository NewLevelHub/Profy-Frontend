import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { label: 'Пользователи', path: '/admin/users' },
  { label: 'Фидбек', path: '/admin/feedback' },
] as const;

export function AdminTabs() {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-2 border-b border-default">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              'px-4 py-2.5 font-bold text-sm border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-brand text-brand'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
