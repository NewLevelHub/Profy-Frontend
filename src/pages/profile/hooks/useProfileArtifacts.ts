import { useProfileStore } from '@/shared/store/profile';

/**
 * Real backing data for the junior "ТЫ РАССКАЗАЛ О СЕБЕ" card — `ProfileResponse`
 * has no free-text bio field, so the closest honest analog is the artifacts the
 * child already picked during onboarding (`ArtifactsSetupPage` → `/onboarding/artifacts`):
 * hobbies, games, books, dreams, etc. Sourced straight off the profile the
 * store already fetched (GET /profile returns artifacts embedded) rather than
 * a separate request.
 */
export function useProfileArtifacts(enabled: boolean) {
  const profile = useProfileStore(s => s.profile);
  const isLoaded = useProfileStore(s => s.isLoaded);

  return {
    artifacts: enabled ? (profile?.artifacts ?? []) : [],
    isLoading: enabled && !isLoaded,
    isError: false,
  };
}
