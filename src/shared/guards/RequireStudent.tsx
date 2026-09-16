import { Navigate, Outlet } from 'react-router';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';

/**
 * Student-facing routes (/results, assessment, profile, …). Psychologists
 * have their own cabinet and must not land on "start the test" — the logo
 * and bookmarks still pointed at /results before this guard.
 */
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

  if (user?.role === 'psychologist') {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return <Outlet />;
}
