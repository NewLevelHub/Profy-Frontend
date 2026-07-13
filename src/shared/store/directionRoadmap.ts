import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DirectionRoadmapResponse } from '@/shared/types';

interface DirectionRoadmapState {
  /** Direction the student confirmed as a fit — mirrors assessments.selected_direction_slug. */
  selectedDirectionSlug: string | null;
  roadmap: DirectionRoadmapResponse | null;
  setRoadmap: (roadmap: DirectionRoadmapResponse) => void;
  clearRoadmap: () => void;
}

export const useDirectionRoadmapStore = create<DirectionRoadmapState>()(
  persist(
    (set) => ({
      selectedDirectionSlug: null,
      roadmap: null,
      setRoadmap: (roadmap) =>
        set({ roadmap, selectedDirectionSlug: roadmap.direction_slug }),
      clearRoadmap: () => set({ roadmap: null, selectedDirectionSlug: null }),
    }),
    { name: 'profy-direction-roadmap' },
  ),
);
