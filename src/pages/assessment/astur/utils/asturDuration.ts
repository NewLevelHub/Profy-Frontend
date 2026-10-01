import type { AsturContentSubtest } from '@/shared/types';

/** Whole minutes the АСТУР block can take at most (PRO-440): every timed
 *  subtest's limit plus lability, which has no subtest limit but a cap per
 *  item. The real pass is usually shorter — this is the honest ceiling the
 *  block intro shows, not a guess. */
export function asturMaxMinutes(subtests: AsturContentSubtest[], labilityItemLimitMs: number): number {
  const seconds = subtests.reduce((sum, subtest) => {
    if (subtest.time_limit_sec !== null) return sum + subtest.time_limit_sec;
    if (subtest.key === 'lability') return sum + (subtest.item_count * labilityItemLimitMs) / 1000;
    return sum;
  }, 0);
  return Math.round(seconds / 60);
}
