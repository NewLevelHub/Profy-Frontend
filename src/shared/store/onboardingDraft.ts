import { create } from 'zustand';
import type { ArtifactItem, CertificateItem } from '@/shared/types';

// Backend accepts profile + artifacts in one transaction. This store carries
// the unsaved handoff between the profile and artifacts screens, and is also
// session-private data that must be cleared when the authenticated identity
// changes.
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
  certificates: CertificateItem[];
}

interface OnboardingDraftState {
  profileDraft: OnboardingProfileDraft | null;
  artifactsDraft: ArtifactItem[] | null;
  setProfileDraft: (draft: OnboardingProfileDraft) => void;
  setArtifactsDraft: (items: ArtifactItem[]) => void;
  clearArtifactsDraft: () => void;
  clearDrafts: () => void;
}

export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  profileDraft: null,
  artifactsDraft: null,
  setProfileDraft: (profileDraft) => set({ profileDraft }),
  setArtifactsDraft: (artifactsDraft) => set({ artifactsDraft }),
  clearArtifactsDraft: () => set({ artifactsDraft: null }),
  clearDrafts: () => set({ profileDraft: null, artifactsDraft: null }),
}));
