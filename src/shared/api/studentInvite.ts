import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';

/** The CRM's one-time link that ties a student account to the deal
 *  (ТЗ §4.4; backend docs/frontend-crm-api-contract.md §13). */
const STORAGE_KEY = 'profy.studentInvite';

export const studentInviteApi = {
  accept: (token: string) => apiClient.post(API.studentInvites.accept, { token }),
};

/** The token waits here while the student signs up or signs in — through
 *  email verification, which can take a while. */
export const pendingStudentInvite = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // Private mode: the student opens the link again after signing in.
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored.
    }
  },
};
