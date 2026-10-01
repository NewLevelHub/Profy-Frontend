import { Navigate, Outlet } from 'react-router';
import { homePathForUser, isStaffUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';

/** Student-only surfaces (assessment, results, onboarding). Staff bounce home. */
export function RequireStudent() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isStaffUser(user)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return <Outlet />;
}
