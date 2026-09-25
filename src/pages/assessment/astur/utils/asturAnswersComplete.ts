import type { AsturContentSubtest, AsturItemAnswer } from '@/shared/types';

/** Local per-subtest answer state. A blank is never an answer (PRO-427
 *  §11): an item is either answered, explicitly skipped, or still open.
 *  Logical schemas are served pre-shuffled, so their order only counts as an
 *  answer once the student has actually worked with it (`touched`). */
export interface AsturAnswerState {
  values: Record<string, unknown>;
  skipped: Set<string>;
  touched: Set<string>;
}

/** Whether a single ASTUR item has a usable answer (PRO-400 gating). */
export function isAsturItemAnswered(
  subtestKey: AsturContentSubtest['key'],
  value: unknown,
  touched = true,
): boolean {
  switch (subtestKey) {
    case 'classification':
      return Array.isArray(value) && value.length === 2;
    case 'numeric_series': {
      if (!Array.isArray(value) || value.length !== 2) return false;
      return (value as [string, string]).every((part) => /^-?\d+$/.test(String(part).trim()));
    }
    case 'generalization':
      return typeof value === 'string' && value.trim() !== '';
    case 'logical_schemas':
      return touched && Array.isArray(value) && value.length > 0;
    default:
      // awareness | analogies | geometric_figures — single picked option
      return typeof value === 'string' && value !== '';
  }
}

/** Answered or explicitly skipped — either lets the student move on. */
export function isAsturItemDone(subtest: AsturContentSubtest, state: AsturAnswerState, index: string): boolean {
  return (
    state.skipped.has(index) ||
    isAsturItemAnswered(subtest.key, state.values[index], state.touched.has(index))
  );
}

export function areAllAsturItemsDone(subtest: AsturContentSubtest, state: AsturAnswerState): boolean {
  return subtest.items.every((_, i) => isAsturItemDone(subtest, state, String(i + 1)));
}

/** Items that will be sent as skipped: explicitly skipped, or still open
 *  when the subtest ends (only possible on timeout). */
export function countAsturSkipped(subtest: AsturContentSubtest, state: AsturAnswerState): number {
  return subtest.items.filter((_, i) => {
    const index = String(i + 1);
    return state.skipped.has(index) || !isAsturItemAnswered(subtest.key, state.values[index], state.touched.has(index));
  }).length;
}

/** Numeric inputs hold strings; the server wants integers. Never turns an
 *  empty field into 0 — an unfilled pair is not an answer at all. */
function answerValue(subtestKey: AsturContentSubtest['key'], value: unknown): unknown {
  if (subtestKey !== 'numeric_series') return value;
  return (value as [string, string]).map((part) => Number.parseInt(String(part).trim(), 10));
}

export function buildAsturAnswerPayload(
  subtest: AsturContentSubtest,
  state: AsturAnswerState,
): Record<string, AsturItemAnswer> {
  return Object.fromEntries(
    subtest.items.map((_, i) => {
      const index = String(i + 1);
      const value = state.values[index];
      const answered =
        !state.skipped.has(index) && isAsturItemAnswered(subtest.key, value, state.touched.has(index));
      const answer: AsturItemAnswer = answered
        ? { status: 'answered', value: answerValue(subtest.key, value) }
        : { status: 'skipped', value: null };
      return [index, answer];
    }),
  );
}
