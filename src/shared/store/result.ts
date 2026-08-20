import { create } from 'zustand';
import type { ResultResponse } from '@/shared/types';

interface ResultState {
  report: ResultResponse | null;
  setReport: (report: ResultResponse) => void;
  clearReport: () => void;
}

export const useResultStore = create<ResultState>()((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  clearReport: () => set({ report: null }),
}));
