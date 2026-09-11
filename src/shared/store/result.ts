import { create } from 'zustand';
import type { ResultResponse } from '@/shared/types';

interface ResultState {
  report: ResultResponse | null;
  /**
   * Locale the stored `report` was fetched under. `null` when it was set
   * without one (ResultLoadingPage, right after generation) — the hook then
   * treats it as "whatever the current locale is", since the backend generates
   * the report in the owner's language anyway (KZ-403/405/406).
   */
  reportLocale: string | null;
  setReport: (report: ResultResponse, locale?: string | null) => void;
  clearReport: () => void;
}

export const useResultStore = create<ResultState>()((set) => ({
  report: null,
  reportLocale: null,
  setReport: (report, locale = null) => set({ report, reportLocale: locale ?? null }),
  clearReport: () => set({ report: null, reportLocale: null }),
}));
