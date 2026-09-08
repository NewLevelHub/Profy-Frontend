import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { toPath } from '@/shared/lib/returnTo';

export function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: toPath(location) }} replace />;
  }

  return <Outlet />;
}
