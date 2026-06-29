import { create } from 'zustand';
import type { ProfileResponse } from '@/shared/types';

interface ProfileState {
  profile: ProfileResponse | null;
  isLoaded: boolean;
  setProfile: (profile: ProfileResponse) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  isLoaded: false,
  setProfile: (profile) => set({ profile, isLoaded: true }),
  clearProfile: () => set({ profile: null, isLoaded: false }),
}));
