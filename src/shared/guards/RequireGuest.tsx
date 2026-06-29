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
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
}
