import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetUserSession } from '@/shared/lib/session';
import type { User } from '@/shared/types';

interface AuthState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      login: (token, user) => {
        resetUserSession();
        set({ token, user });
      },
      logout: () => {
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
