import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { authApi } from '@/shared/api/auth';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';

export function RequirePsychologist() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !token) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const me = await authApi.me();
        if (cancelled) return;
        setUser(me);
        setAllowed(me.role === 'psychologist');
      } catch {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    if (user?.role === 'psychologist') {
      setAllowed(true);
      setChecking(false);
      return;
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, token, user?.role, setUser]);

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

  if (!allowed) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return <Outlet />;
}
