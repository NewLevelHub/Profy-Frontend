import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';

export function RequireAdmin() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !token) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function verifyAdmin() {
      try {
        const me = await authApi.me();
        if (cancelled) return;
        setUser(me);
        setIsAdmin(Boolean(me.is_admin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    if (user?.is_admin) {
      setIsAdmin(true);
      setChecking(false);
      return;
    }

    verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, token, user?.is_admin, setUser]);

  if (!hasHydrated || checking) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/results" replace />;
  }

  return <Outlet />;
}
