import { useQuery } from '@tanstack/react-query';
import { artifactsApi } from '@/shared/api/artifacts';

/**
 * Real backing data for the junior "ТЫ РАССКАЗАЛ О СЕБЕ" card — `ProfileResponse`
 * has no free-text bio field, so the closest honest analog is the artifacts the
 * child already picked during onboarding (`ArtifactsSetupPage` → `/profile/artifacts`):
 * hobbies, games, books, dreams, etc. Fetched only when the junior variant
 * actually renders this section.
 */
export function useProfileArtifacts(enabled: boolean) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-artifacts'] as const,
    queryFn: () => artifactsApi.get(),
    enabled,
    staleTime: 60_000,
  });

  return {
    artifacts: Array.isArray(data) ? data : [],
    isLoading: enabled && isLoading,
    isError,
  };
}
