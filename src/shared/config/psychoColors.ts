/**
 * МЦВ (Собчик) — 8 цветовых эталонов, единый источник для всего фронтенда.
 * HEX **побайтово** из методзаписки `тестЛюшера.md` §4 / `psych-block-spec.md`
 * §B3 — приёмочный критерий, менять нельзя. `id` (0–7) неизменен: используется
 * во всех формулах бэкенда и уходит в `list1`/`list2`, а также в
 * `PsychEmotionalSection.choice_1` / `choice_2` в отчёте.
 *
 * Прохождение теста (`pages/assessment/psychoemotional`) и разбор в отчёте
 * (`pages/results/components/psych`) берут палитру отсюда — не дублируют.
 */
export interface PsychoColor {
  id: number;
  name: string;
  hex: string;
}

export const PSYCHO_COLORS: readonly PsychoColor[] = [
  { id: 1, name: 'синий', hex: '#004983' },
  { id: 2, name: 'зелёный', hex: '#1D9772' },
  { id: 3, name: 'красный', hex: '#F12F23' },
  { id: 4, name: 'жёлтый', hex: '#F2DD00' },
  { id: 5, name: 'фиолетовый', hex: '#D42481' },
  { id: 6, name: 'коричневый', hex: '#C55223' },
  { id: 7, name: 'чёрный', hex: '#231F20' },
  { id: 0, name: 'серый', hex: '#98938D' },
] as const;

export const PSYCHO_COLOR_BY_ID: Readonly<Record<number, PsychoColor>> =
  Object.fromEntries(PSYCHO_COLORS.map((c) => [c.id, c]));

/** Число плашек в каждом круге выбора. */
export const PSYCHO_CHOICE_COUNT = 8;
