import type { User, UserRole } from '@/shared/types';

/** CRM roles that have no cabinet in this app — they work in Profy-CRM. */
const CRM_ONLY_ROLES: readonly UserRole[] = ['sales_head', 'sales_manager', 'marketer'];

/** Every non-student account — no student assessment / results shell. */
export function isStaffUser(user: Pick<User, 'role' | 'is_admin'> | null | undefined): boolean {
  if (!user) return false;
  if (user.role && user.role !== 'student') return true;
  return Boolean(user.is_admin);
}

/** Post-login / guest-bounce home for each role. Staff must not land on
 *  `/results` — those routes are student-gated server-side (403). */
export function homePathForUser(user: Pick<User, 'role' | 'is_admin'> | null | undefined): string {
  const role: UserRole | undefined = user?.role ?? (user?.is_admin ? 'admin' : undefined);
  if (role === 'psychologist') return '/psychologist';
  // The owner's part of this app is the specialists' schedule (ТЗ §4.1).
  if (role === 'owner') return '/psychologist/schedule';
  if (role && CRM_ONLY_ROLES.includes(role)) return '/staff';
  if (role === 'admin' || user?.is_admin) return '/admin/users';
  return '/results';
}
