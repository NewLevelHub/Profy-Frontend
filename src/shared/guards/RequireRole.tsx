import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api/auth';
import { homePathForUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import type { User } from '@/shared/types';

type StaffRole = 'admin' | 'psychologist';

function hasRole(user: Pick<User, 'role' | 'is_admin'> | null | undefined, role: StaffRole): boolean {
  if (role === 'admin') return user?.role === 'admin' || Boolean(user?.is_admin);
  return user?.role === role;
}

/**
 * Staff cabinet gate. Sits under RequireAuth, so the store is hydrated and a
 * token exists. The persisted user is trusted when it already has the role;
 * otherwise it may be stale (role granted server-side since the last login),
 * so /auth/me decides before bouncing the visitor to their own home.
 * The UI gate only hides screens — the API checks the role on every call.
 */
export function RequireRole({ role }: { role: StaffRole }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const allowedFromStore = hasRole(user, role);

  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !allowedFromStore,
    retry: false,
  });

  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data, setUser]);

  if (allowedFromStore || hasRole(me.data, role)) return <Outlet />;
  if (me.isPending) return <FullPageSpinner />;
  return <Navigate to={homePathForUser(me.data ?? user)} replace />;
}
