import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Круг 1 (первый выбор цветов) теперь проходится ПЕРЕД основной батареей
 * тестов, круг 2 — после неё (PRO-3xx redesign). Между ними — вся батарея +
 * pairs + motivation, то есть много страниц и, возможно, перезагрузка
 * вкладки, поэтому это состояние **персистится** (в отличие от
 * `usePsychoEmotionalStore` ниже), пока не будет закрыто finish-запросом.
 *
 * Привязано к конкретному `assessmentId` — `hasPendingRun(id)` сверяет его,
 * так что старый run от прошлого прохождения не подставится случайно.
 */
interface PsychoColorRunState {
  assessmentId: string | null;
  runId: string | null;
  list1: number[];
  list1DtMs: number[];

  setRun: (assessmentId: string, runId: string, list1: number[], list1DtMs: number[]) => void;
  reset: () => void;
}

const RUN_INITIAL = {
  assessmentId: null as string | null,
  runId: null as string | null,
  list1: [] as number[],
  list1DtMs: [] as number[],
};

export const usePsychoColorRunStore = create<PsychoColorRunState>()(
  persist(
    (set) => ({
      ...RUN_INITIAL,
      setRun: (assessmentId, runId, list1, list1DtMs) =>
        set({ assessmentId, runId, list1, list1DtMs }),
      reset: () => set({ ...RUN_INITIAL }),
    }),
    { name: 'profy-psycho-color-run' },
  ),
);

/** Круг 1 для `assessmentId` уже отправлен и ждёт finish. */
export function hasPendingColorRun(assessmentId: string): boolean {
  const s = usePsychoColorRunStore.getState();
  return s.assessmentId === assessmentId && s.runId !== null;
}

/**
 * Шаг-машина финального экрана психоблока (check-in → круг 2), PRO-3xx. Живёт
 * только на странице `PsychoEmotionalPage` — **не персистится**, как и
 * раньше: бросил на середине → при следующем заходе начинается заново.
 */
export type PsychoFinishStep = 'checkin' | 'circle2';

interface PsychoEmotionalState {
  step: PsychoFinishStep;
  checkin: Record<string, string>;

  setCheckin: (checkin: Record<string, string>) => void;
  reset: () => void;
}

const FINISH_INITIAL = {
  step: 'checkin' as PsychoFinishStep,
  checkin: {} as Record<string, string>,
};

export const usePsychoEmotionalStore = create<PsychoEmotionalState>((set) => ({
  ...FINISH_INITIAL,
  setCheckin: (checkin) => set({ checkin, step: 'circle2' }),
  reset: () => set({ ...FINISH_INITIAL }),
}));
