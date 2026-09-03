import type { InterestMapItem } from '@/shared/types';

/**
 * "Leading type in words" derivation for the interest map — shared by the
 * on-screen section (InterestDomainSection) and the printable/PDF version
 * (print/), so both name the same leading types from the same data instead
 * of drifting apart.
 *
 * Never a RIASEC letter or MI code — always the human-readable label/sphere
 * name. `level` is the only ranking signal the result-v2 contract gives us
 * (§5, opaque low/medium/high, no underlying score), so "leading" means
 * every item at `level: 'high'` — which is how the spec's leading-tie case
 * (two types marked ВЕДУЩЕЕ at once) falls out naturally, no tie-break
 * logic needed. Falls back to `medium` items, then the first item, if
 * nothing is `high` (a flat/low profile is legitimate per contract §8).
 */
export function pickHeadlineItems(items: InterestMapItem[]): InterestMapItem[] {
  if (items.length === 0) return [];
  const leading = items.filter((i) => i.level === 'high');
  const pool = leading.length > 0 ? leading : items.filter((i) => i.level === 'medium');
  const picked = pool.length > 0 ? pool : items.slice(0, 1);
  return picked.slice(0, 2);
}

/**
 * The mockup's exact phrasing ("Исследующий с сильной артистической
 * частью") is hand-authored NLG the backend doesn't supply — RIASEC_LABELS/
 * MI_LABELS are plain nominative-case labels, not declinable sentence
 * fragments — so a tie is rendered as "{Label} + {Label}" rather than
 * attempting Russian case agreement from data that isn't there.
 */
export function buildHeadline(items: InterestMapItem[], labels: Record<string, string>): string {
  return pickHeadlineItems(items).map((i) => labels[i.code] ?? i.sphere).join(' + ');
}

/** "также заметно: {secondary types}" — medium-level types not already in the headline. */
export function buildSecondaryNote(items: InterestMapItem[], labels: Record<string, string>): string {
  const leadingCodes = new Set(items.filter((i) => i.level === 'high').map((i) => i.code));
  const secondary = items.filter((i) => i.level === 'medium' && !leadingCodes.has(i.code));
  if (secondary.length === 0) return '';
  return secondary.map((i) => labels[i.code] ?? i.sphere).join(', ');
}
