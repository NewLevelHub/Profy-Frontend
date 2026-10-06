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

const PRIVATE_LOCAL_STORAGE_PREFIXES = [
  // Durable fallback written by ASTUR pagehide recovery. It contains the
  // previous user's assessment/run IDs and must not cross a logout/login.
  'profy-astur-abandoned:',
] as const;

function clearStorageByPrefixes(storage: Storage, prefixes: readonly string[]) {
  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) storage.removeItem(key);
  } catch {
    // Storage may be unavailable in hardened/private browser modes. The
    // in-memory stores and React Query cache are still cleared below.
  }
}

function clearPrivateBrowserStorage() {
  if (typeof sessionStorage !== 'undefined') {
    clearStorageByPrefixes(sessionStorage, PRIVATE_SESSION_STORAGE_PREFIXES);
  }
  if (typeof localStorage !== 'undefined') {
    clearStorageByPrefixes(localStorage, PRIVATE_LOCAL_STORAGE_PREFIXES);
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
  clearPrivateBrowserStorage();
}
