import { useAuthStore } from '@/shared/store/auth';

export function useAuth() {
  const store = useAuthStore();

  function logout() {
    store.logout();
  }

  return { ...store, logout };
}

export function useUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.token !== null);
}
