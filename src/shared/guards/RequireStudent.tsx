import { Navigate, Outlet } from 'react-router';
import { usePendingStudentInvite } from '@/shared/hooks/usePendingStudentInvite';
import { homePathForUser, isStaffUser } from '@/shared/lib/homePath';
import { useAuthStore } from '@/shared/store/auth';
import { FullPageSpinner } from '@/shared/ui/Spinner';

/** Student-only surfaces (assessment, results, onboarding). Staff bounce home. */
export function RequireStudent() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  usePendingStudentInvite();

  if (!hasHydrated) {
    return <FullPageSpinner />;
  }

  if (isStaffUser(user)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  return <Outlet />;
}
