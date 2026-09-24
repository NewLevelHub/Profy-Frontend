import type { InterestMapItem } from '@/shared/types';

/**
 * Level cut-offs on the 0-100 `details.score` scale — mirror of the
 * backend's scoring_levels.py (LEVEL_MEDIUM_MIN / LEVEL_HIGH_MIN). Used only
 * to draw the marks on the level meter and the hexagon, so the picture shows
 * exactly the bar a type had to clear; the level itself always comes from
 * the server.
 */
export const LEVEL_MEDIUM_MIN = 50;
export const LEVEL_HIGH_MIN = 70;

/**
 * "Leading type in words" derivation for the interest map — shared by the
 * on-screen section (InterestDomainSection) and the printable/PDF version
 * (print/), so both name the same leading types from the same data instead
 * of drifting apart.
 *
 * Never a RIASEC letter or MI code — always the human-readable label/sphere
 * name. "Leading" means every item at `level: 'high'` (up to three — a
 * Holland code is three letters, and cutting at two silently dropped a real
 * third leading type), falling back to `medium` items, then the first item,
 * if nothing is `high` (a flat/low profile is legitimate per contract §8).
 */
function pickHeadlineItems(items: InterestMapItem[]): InterestMapItem[] {
  if (items.length === 0) return [];
  const leading = items.filter((i) => i.level === 'high');
  const pool = leading.length > 0 ? leading : items.filter((i) => i.level === 'medium');
  const picked = pool.length > 0 ? pool : items.slice(0, 1);
  return picked.slice(0, 3);
}

/**
 * The mockup's exact phrasing ("Исследующий с сильной артистической
 * частью") is hand-authored NLG the backend doesn't supply — RIASEC_LABELS
 * are plain nominative-case labels, not declinable sentence
 * fragments — so a tie is rendered as "{Label} + {Label}" rather than
 * attempting Russian case agreement from data that isn't there.
 */
export function buildHeadline(items: InterestMapItem[], labels: Record<string, string>): string {
  return pickHeadlineItems(items).map((i) => labels[i.code] ?? i.sphere).join(' + ');
}

/** "также заметно: {secondary types}" — medium-level types not already in the headline. */
export function buildSecondaryNote(items: InterestMapItem[], labels: Record<string, string>): string {
  const headlineCodes = new Set(pickHeadlineItems(items).map((i) => i.code));
  const secondary = items.filter((i) => i.level === 'medium' && !headlineCodes.has(i.code));
  if (secondary.length === 0) return '';
  return secondary.map((i) => labels[i.code] ?? i.sphere).join(', ');
}
