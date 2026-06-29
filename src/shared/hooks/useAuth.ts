import { useAuthStore } from '@/shared/store/auth';

export function useAuth() {
  return useAuthStore();
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
