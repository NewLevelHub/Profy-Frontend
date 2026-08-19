import { create } from 'zustand';

// Backend now accepts profile + artifacts in a single POST /profile call
// (one transaction — nothing half-created if artifacts are invalid), so
// onboarding no longer saves the profile at the end of step 4 and artifacts
// separately at the end of step 9. Instead ProfileSetupPage just parks the
// collected fields here when the student moves on to artifacts, and
// ArtifactsSetupPage sends everything together on the final "Готово".
//
// Not persisted — this only needs to survive the client-side route change
// between the two onboarding pages within one session, same lifetime as
// useProfileStore. Settings-based edits (editing an already-onboarded
// profile, or artifacts, from Profile settings) never touch this — they
// keep using the old separate PUT /profile and POST /profile/artifacts
// calls untouched by this change.
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
