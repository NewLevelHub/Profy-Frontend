import type { AsturContentSubtest } from '@/shared/types';

/** Whether a single ASTUR item has a usable answer for submit gating (PRO-400). */
export function isAsturItemAnswered(subtestKey: AsturContentSubtest['key'], value: unknown): boolean {
  switch (subtestKey) {
    case 'classification':
      return Array.isArray(value) && value.length === 2;
    case 'numeric_series': {
      if (!Array.isArray(value) || value.length !== 2) return false;
      const [a, b] = value as [string, string];
      return String(a).trim() !== '' && String(b).trim() !== '';
    }
    case 'generalization':
      return typeof value === 'string' && value.trim() !== '';
    case 'logical_schemas':
      return Array.isArray(value) && value.length > 0;
    default:
      // awareness | analogies | geometric_figures — single picked option
      return typeof value === 'string' && value !== '';
  }
}

export function areAllAsturItemsAnswered(
  subtest: AsturContentSubtest,
  answers: Record<string, unknown>,
): boolean {
  return subtest.items.every((_, i) =>
    isAsturItemAnswered(subtest.key, answers[String(i + 1)]),
  );
}
