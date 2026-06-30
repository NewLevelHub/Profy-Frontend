import { useAuthStore } from '@/shared/store/auth';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';
import { queryClient } from '@/shared/lib/queryClient';

export function useAuth() {
  const store = useAuthStore();

  function logout() {
    store.logout();
    queryClient.clear();
    useAssessmentStore.getState().resetAssessment();
    useProfileStore.getState().clearProfile();
    useResultStore.getState().clearReport();
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
