import { Link, Outlet, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { PageContainer } from '@/shared/ui/PageContainer';
import { MONO_LABEL } from '@/shared/ui/admin/density';

const CONTENT_NAV_ITEMS = [
  { to: '/admin/content/questions', label: 'Вопросы' },
  { to: '/admin/content/question-pairs', label: 'Пары вопросов' },
  { to: '/admin/content/motivation-statements', label: 'Утверждения мотивации' },
  { to: '/admin/content/motivation-pairs', label: 'Пары мотивации' },
  { to: '/admin/content/directions', label: 'Направления' },
] as const;

/**
 * Second-level tab bar for the 5 question-bank content entities
 * (docs/admin-questions-content-overrides-plan.md) — nested one level below
 * `AdminLayout`'s top nav rather than 5 more top-level tabs, so the main
 * admin nav doesn't get crowded.
 */
export function AdminContentLayout() {
  const location = useLocation();

  return (
    <PageContainer className="space-y-4">
      <nav className="flex items-center gap-1 flex-wrap">
        {CONTENT_NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                MONO_LABEL,
                'px-2.5 py-1.5 rounded-[3px] transition-colors',
                isActive ? 'bg-brand-subtle text-brand' : 'text-muted hover:text-secondary',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </PageContainer>
  );
}
