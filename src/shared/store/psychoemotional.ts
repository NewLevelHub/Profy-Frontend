import { create } from 'zustand';

/**
 * Состояние прохождения психоэмоционального блока (PRO-306). **Не
 * персистится** — бросил на середине → при следующем заходе начинается
 * заново (UX-край PRO-302). Держит только сырые данные, которые уйдут в
 * `POST /assessment/{id}/psychoemotional`; шаг рендера выводится из них.
 */
export type PsychoStep = 'checkin' | 'circle1' | 'pause' | 'circle2';

interface PsychoEmotionalState {
  step: PsychoStep;
  checkin: Record<string, string>;
  /** Порядок выбора цветов (ID), от приятного к неприятному. */
  list1: number[];
  list2: number[];
  /** Δt каждого выбора в мс (первый — время до первого выбора). */
  list1DtMs: number[];
  list2DtMs: number[];
  /** epoch ms начала паузы — для фактической длительности. */
  pauseStartedAt: number | null;
  pauseActualSec: number | null;

  setCheckin: (checkin: Record<string, string>) => void;
  recordCircle1: (order: number[], dtMs: number[]) => void;
  startPause: () => void;
  finishPause: (actualSec: number) => void;
  recordCircle2: (order: number[], dtMs: number[]) => void;
  reset: () => void;
}

const INITIAL = {
  step: 'checkin' as PsychoStep,
  checkin: {},
  list1: [] as number[],
  list2: [] as number[],
  list1DtMs: [] as number[],
  list2DtMs: [] as number[],
  pauseStartedAt: null as number | null,
  pauseActualSec: null as number | null,
};

export const usePsychoEmotionalStore = create<PsychoEmotionalState>((set) => ({
  ...INITIAL,
  setCheckin: (checkin) => set({ checkin, step: 'circle1' }),
  recordCircle1: (list1, list1DtMs) =>
    set({ list1, list1DtMs, step: 'pause', pauseStartedAt: Date.now() }),
  startPause: () => set({ pauseStartedAt: Date.now() }),
  finishPause: (pauseActualSec) => set({ pauseActualSec, step: 'circle2' }),
  recordCircle2: (list2, list2DtMs) => set({ list2, list2DtMs }),
  reset: () => set({ ...INITIAL }),
}));
