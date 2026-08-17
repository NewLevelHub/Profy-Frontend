import { Link, Outlet, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/shared/store/auth';
import { deriveAdminRole } from '@/shared/lib/adminRole';
import { RoleBadge } from '@/shared/ui/admin/RoleBadge';
import { MONO_LABEL } from '@/shared/ui/admin/density';

/**
 * Nav tabs the spec asks for: users / assessments / directions / "содержание
 * писем". Only `/admin/users` (and its `:userId` detail sub-route) actually
 * exists in the router today — the other three have no page, no route, no
 * backend behind them. Per the investigate-before-fabricating rule for this
 * pass, we don't render placeholder tabs for routes that 404; add entries
 * here only once the corresponding route lands in `app/router.tsx`.
 */
const ADMIN_NAV_ITEMS = [{ to: '/admin/users', label: 'Пользователи' }] as const;

/**
 * Persistent chrome shared by every `/admin/*` page: wordmark + role
 * indicator + section nav, kept in its own layout (rather than duplicated
 * per-page) so it stays visible "at all times" per the design spec regardless
 * of which admin page is active. Nests inside `AppLayout` / `RequireAdmin`,
 * mirroring the `AppLayout` / `AuthLayout` convention already used in
 * `shared/ui/layouts`.
 */
export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const role = deriveAdminRole(user?.is_admin);
  const location = useLocation();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-5">
          <span className="font-display font-semibold text-[15px] text-primary tracking-[-0.01em]">
            Profy
          </span>
          <nav className="flex items-center gap-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    MONO_LABEL,
                    'px-2.5 py-1.5 rounded-[3px] border-b-2 transition-colors',
                    isActive
                      ? 'border-[var(--pine)] text-primary'
                      : 'border-transparent text-muted hover:text-secondary',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <RoleBadge role={role} />
      </div>
      <Outlet />
    </div>
  );
}
