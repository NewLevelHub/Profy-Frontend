import { useEffect, useRef } from 'react';
import { apiErrorCode } from '@/shared/api/client';
import { pendingStudentInvite, studentInviteApi } from '@/shared/api/studentInvite';
import { useAuthStore } from '@/shared/store/auth';

/** A student who opened the CRM invite link as a guest and then signed up
 *  or signed in: tie the account to the deal once, quietly. A link that no
 *  longer works is dropped; a network failure keeps it for the next visit. */
export function usePendingStudentInvite() {
  const role = useAuthStore((s) => s.user?.role);
  const started = useRef(false);

  useEffect(() => {
    if (role !== 'student' || started.current) return;
    const token = pendingStudentInvite.get();
    if (!token) return;
    started.current = true;
    studentInviteApi.accept(token).then(
      () => pendingStudentInvite.clear(),
      (error: unknown) => {
        if (apiErrorCode(error)) pendingStudentInvite.clear();
      },
    );
  }, [role]);
}
