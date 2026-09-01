import { create } from 'zustand';
import type { CertificateItem } from '@/shared/types';

// Backend now accepts profile + artifacts in a single POST /profile call
// (one transaction — nothing half-created if artifacts are invalid), so
// onboarding no longer saves the profile at the end of step 4 and artifacts
// separately at the end of step 9. Instead ProfileSetupPage just parks the
// collected fields here when the student moves on to artifacts, and
// ArtifactsSetupPage sends everything together on the final "Готово".
//
// Not persisted — this only needs to survive the client-side route change
// between the two onboarding pages within one session, same lifetime as
// useProfileStore. Settings-based personal-info edits (from Profile
// settings' "Изменить") go through this same handoff now too — the only
// difference is ArtifactsSetupPage sends PUT instead of POST at the end,
// decided by whether a profile already exists (see useArtifactsSetup.ts's
// hasExistingProfile). Editing artifacts alone (ArtifactsSection's own
// "Изменить"/"Добавить") is the one flow that still skips this store
// entirely and calls POST /profile/artifacts directly.
export interface OnboardingProfileDraft {
  name: string;
  age: string;
  grade: string;
  city: string;
  country: string;
  language: string;
  subjectsLike: string[];
  subjectsDislike: string[];
  subjectsEasy: string[];
  subjectsHard: string[];
  /** Exam scores collected by step 2's optional block — already parsed and
   *  range-checked (see useProfileSetup's validateScores), so
   *  ArtifactsSetupPage can hand them straight to the API. Only exams the
   *  student actually ticked appear here; an empty list means "none sat yet",
   *  which still replaces whatever was stored (same wholesale-replace
   *  contract as artifacts). */
  certificates: CertificateItem[];
}

interface OnboardingDraftState {
  profileDraft: OnboardingProfileDraft | null;
  setProfileDraft: (draft: OnboardingProfileDraft) => void;
  clearProfileDraft: () => void;
}

export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  profileDraft: null,
  setProfileDraft: (profileDraft) => set({ profileDraft }),
  clearProfileDraft: () => set({ profileDraft: null }),
}));
