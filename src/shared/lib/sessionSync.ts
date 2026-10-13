import { useAuthStore } from '@/shared/store/auth';

const AUTH_STORAGE_KEY = 'profy-auth';

/** The session as persisted in localStorage — shared by every open tab. */
export function readStoredSession(): { token: string | null; userId: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { state?: { token?: string | null; user?: { id?: string } | null } }) : null;
    return { token: parsed?.state?.token ?? null, userId: parsed?.state?.user?.id ?? null };
  } catch {
    return { token: null, userId: null };
  }
}

/**
 * Brings this tab in line with a sign-in or sign-out done in another tab.
 * Without it a tab kept showing the previous person's name, profile and
 * results after they signed out elsewhere, and once someone else signed in
 * it sent *their* token with the old person's forms (a shared school
 * computer is the realistic case). Returns true when the tab is leaving.
 *
 * Leaving is a full page load, not a router navigation: it drops every
 * in-memory trace of the previous session. The shared localStorage is left
 * alone — the other tab has already reset it, and this one must not undo
 * what that tab wrote for the new session.
 */
export function syncSessionFromStorage(): boolean {
  const { token, user } = useAuthStore.getState();
  const stored = readStoredSession();
  if (stored.token === token) return false;

  if (!stored.token) {
    // Same return path as client.ts's 401 handler: after signing in again
    // the person lands back on the screen they were on.
    const here = window.location.pathname + window.location.search;
    window.location.replace(here.startsWith('/login') ? '/login' : `/login?next=${encodeURIComponent(here)}`);
    return true;
  }
  if (token && stored.userId !== null && stored.userId === user?.id) {
    // The same person signed in again elsewhere: just take the new token.
    void useAuthStore.persist.rehydrate();
    return false;
  }
  // Someone else signed in, or this tab was signed out: start over as them.
  window.location.replace('/');
  return true;
}

export function watchSessionAcrossTabs(): void {
  // `storage` fires only in the other tabs, never in the one that wrote.
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_STORAGE_KEY || event.key === null) syncSessionFromStorage();
  });
}
