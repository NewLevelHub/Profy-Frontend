import { create } from 'zustand';
import type { AkinatorResultResponse } from '@/shared/types';

interface ResultState {
  report: AkinatorResultResponse | null;
  setReport: (report: AkinatorResultResponse) => void;
  clearReport: () => void;
}

export const useResultStore = create<ResultState>()((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  clearReport: () => set({ report: null }),
}));
