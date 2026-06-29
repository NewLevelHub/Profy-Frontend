import { create } from 'zustand';
import type { AnalysisResultResponse } from '@/shared/types';

interface ResultState {
  report: AnalysisResultResponse | null;
  setReport: (report: AnalysisResultResponse) => void;
  clearReport: () => void;
}

export const useResultStore = create<ResultState>()((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  clearReport: () => set({ report: null }),
}));
