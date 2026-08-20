import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';

export function RequireGuest() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (token) {
    // RequireProfile (guarding /results and the rest of the main app) is what
    // decides whether onboarding is still needed — this just hands off to
    // the app root rather than hardcoding /welcome, which is no longer the
    // universal "just logged in" landing spot (it now only shows once,
    // right before a user's first assessment — see useGoalSelection).
    return <Navigate to="/results" replace />;
  }

  return <Outlet />;
}
