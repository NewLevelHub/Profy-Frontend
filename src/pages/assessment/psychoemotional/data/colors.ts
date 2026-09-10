/**
 * МЦВ (Собчик) — стимульный материал круга выбора. Палитра (id → name/hex,
 * §4) живёт в `@/shared/config/psychoColors` (её же читает разбор в отчёте) и
 * ре-экспортируется отсюда; здесь — только то, что нужно самому прохождению:
 * фиксированная раскладка плашек на экране.
 */
export {
  type PsychoColor,
  PSYCHO_COLORS,
  PSYCHO_COLOR_BY_ID,
  PSYCHO_CHOICE_COUNT as CHOICE_COUNT,
} from '@/shared/config/psychoColors';

/**
 * `LAYOUT` — единственное фиксированное расположение плашек на экране,
 * одинаковое для всех пользователей и на обоих кругах (решение 7). Это НЕ
 * порядок выбора — просто как они разложены.
 */
export const LAYOUT: readonly number[] = [3, 1, 4, 6, 2, 0, 5, 7] as const;
