import { queryClient } from '@/shared/lib/queryClient';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';

/** Clear all in-memory and cached data tied to the previous user session. */
export function resetUserSession() {
  useProfileStore.getState().clearProfile();
  useAssessmentStore.getState().resetAssessment();
  useResultStore.getState().clearReport();
  queryClient.removeQueries({ queryKey: ['profile'] });
}
