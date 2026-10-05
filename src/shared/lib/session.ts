import { queryClient } from '@/shared/lib/queryClient';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';
import {
  usePsychoColorRunStore,
  usePsychoStartStore,
} from '@/shared/store/psychoemotional';
import { useOnboardingDraftStore } from '@/shared/store/onboardingDraft';

const PRIVATE_SESSION_STORAGE_PREFIXES = [
  'profy-assessment-',
  'profy-belbin-progress:',
  'profy-astur-',
] as const;

function clearPrivateSessionStorage() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key && PRIVATE_SESSION_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) sessionStorage.removeItem(key);
  } catch {
    // Storage may be unavailable in hardened/private browser modes. The
    // in-memory stores and React Query cache are still cleared below.
  }
}

/** Clear all in-memory and cached data tied to the previous user session. */
export function resetUserSession() {
  // Clear first so no observer can synchronously render the previous user's
  // successful query while the Zustand stores below are being reset. This
  // also drops pending mutations and destroys/cancels active queries.
  queryClient.clear();
  useProfileStore.getState().clearProfile();
  useAssessmentStore.getState().resetAssessment();
  useResultStore.getState().clearReport();
  usePsychoColorRunStore.getState().reset();
  usePsychoStartStore.getState().reset();
  useOnboardingDraftStore.getState().clearDrafts();
  clearPrivateSessionStorage();
}
