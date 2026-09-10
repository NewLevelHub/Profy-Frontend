/**
 * МЦВ (Собчик) — 8 цветовых эталонов. HEX **побайтово** из методзаписки
 * `тестЛюшера.md` §4 / `psych-block-spec.md` §B3 — приёмочный критерий,
 * менять нельзя. `id` (0–7) неизменен, используется во всех формулах бэкенда
 * и уходит в `list1`/`list2`.
 *
 * `LAYOUT` — единственное фиксированное расположение плашек на экране,
 * одинаковое для всех пользователей и на обоих кругах (решение 7). Это НЕ
 * порядок выбора — просто как они разложены.
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

/** Fixed on-screen arrangement — same for everyone, identical on both circles. */
export const LAYOUT: readonly number[] = [3, 1, 4, 6, 2, 0, 5, 7] as const;

export const PSYCHO_COLOR_BY_ID: Readonly<Record<number, PsychoColor>> =
  Object.fromEntries(PSYCHO_COLORS.map((c) => [c.id, c]));

export const CHOICE_COUNT = 8;
