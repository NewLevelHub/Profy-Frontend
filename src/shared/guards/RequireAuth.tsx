import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import { toPath } from '@/shared/lib/returnTo';

export function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return <FullPageSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: toPath(location) }} replace />;
  }

  return <Outlet />;
}
