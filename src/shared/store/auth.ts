import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { revokeSession } from '@/shared/api/revokeSession';
import { resetUserSession } from '@/shared/lib/session';
import type { User } from '@/shared/types';

interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  login: (token: string, user: User) => void;
  /** Ends the session here and on the server. `revoke: false` is for the one
   *  caller that has nothing to revoke: the 401 handler, whose token the
   *  server has just refused. */
  logout: (options?: { revoke?: boolean }) => void;
  setUser: (user: User) => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      login: (token, user) => {
        resetUserSession();
        set({ token, user });
      },
      logout: (options) => {
        const { token } = get();
        if (token && options?.revoke !== false) revokeSession(token);
        resetUserSession();
        set({ token: null, user: null });
      },
      setUser: (user) => set({ user }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'profy-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
