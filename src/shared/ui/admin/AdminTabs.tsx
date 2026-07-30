import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { label: 'Пользователи', path: '/admin/users' },
  { label: 'Фидбек', path: '/admin/feedback' },
] as const;

export function AdminTabs() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-wrap gap-[10px]">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              'text-[16px] font-extrabold px-[26px] py-[12px] rounded-full cursor-pointer transition-all border-2',
              isActive
                ? 'border-[#7C3AED] border-b-[4px] border-b-[#5B21B6] bg-[#7C3AED] text-white'
                : 'border-[#DDD6FE] border-b-[4px] border-b-[#DDD6FE] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:bg-[#EFECFF]'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
