import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AkinatorResultResponse } from '@/shared/types';

interface ResultState {
  report: AkinatorResultResponse | null;
  setReport: (report: AkinatorResultResponse) => void;
  clearReport: () => void;
}

export const useResultStore = create<ResultState>()(
  persist(
    (set) => ({
      report: null,
      setReport: (report) => set({ report }),
      clearReport: () => set({ report: null }),
    }),
    {
      name: 'profy-result',
    },
  ),
);
