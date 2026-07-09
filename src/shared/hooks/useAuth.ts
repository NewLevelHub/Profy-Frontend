import { useAuthStore } from '@/shared/store/auth';
import { queryClient } from '@/shared/lib/queryClient';
import { resetUserSession } from '@/shared/lib/session';

export function useAuth() {
  const store = useAuthStore();

  function logout() {
    store.logout();
    queryClient.clear();
  }

  return { ...store, logout };
}

export function useToken() {
  return useAuthStore((s) => s.token);
}

export function useUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.token !== null);
}
