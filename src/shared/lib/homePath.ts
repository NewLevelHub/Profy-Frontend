import type { User, UserRole } from '@/shared/types';

/** Admin and psychologist — no student assessment / results shell. */
export function isStaffUser(user: Pick<User, 'role' | 'is_admin'> | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'psychologist') return true;
  return Boolean(user.is_admin);
}

/** Post-login / guest-bounce home for each role. Staff must not land on
 *  `/results` — those routes are student-gated server-side (403). */
export function homePathForUser(user: Pick<User, 'role' | 'is_admin'> | null | undefined): string {
  const role: UserRole | undefined = user?.role ?? (user?.is_admin ? 'admin' : undefined);
  if (role === 'psychologist') return '/psychologist';
  if (role === 'admin' || user?.is_admin) return '/admin/users';
  return '/results';
}
