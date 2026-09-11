import type { TFunction } from 'i18next';
import type { InterestMapItem } from '@/shared/types';

export interface SphereCardData {
  code: string;
  title: string;
  /** ПОПРОБОВАТЬ — a concrete, low-stakes thing to try this month. */
  tryNow: string;
  /** ПОНАБЛЮДАТЬ — something to pay attention to while trying it. */
  observe: string;
}

/**
 * "Sphere" data-source investigation (scenario A / explore):
 *
 * `InterestMapItem.sphere` (result-v2 contract §5, already fetched for
 * every user via `report.interest_map`) IS real backend data naming each
 * RIASEC/MI sphere, and `level` is a real signal for ranking them — so the
 * SELECTION of which 4 spheres to show, and their title, is genuinely
 * data-driven (top 4 items by level, `high` before `medium` before `low`).
 *
 * What does NOT exist anywhere in the API: concrete "попробовать/
 * понаблюдать" suggestion copy per sphere. `interest_map` only carries a
 * shared free-text `interest_map_note` for the whole map, not per-item
 * suggestions, and there's no separate "spheres" endpoint distinct from the
 * 6 RIASEC / 8 MI categories. This copy is therefore hand-authored content,
 * now kept in the i18n catalog under `results/sphere.<code>.{try,observe}`
 * keyed by the same `code` values RIASEC_ICONS/MI_ICONS already use — a real
 * content-source gap, flagged rather than presented as if it were
 * personalized. If/when the backend adds per-sphere suggestion text, drop
 * these keys and read that field.
 */
const KNOWN_SPHERE_CODES = new Set([
  // RIASEC
  'R', 'I', 'A', 'S', 'E', 'C',
  // MI (junior)
  'verbal', 'logical', 'musical', 'visual', 'bodily',
  'interpersonal', 'intrapersonal', 'naturalistic',
]);

const LEVEL_RANK: Record<InterestMapItem['level'], number> = { high: 2, medium: 1, low: 0 };

/** Top 4 interest_map items by level, real-data-driven selection. */
export function pickSpheres(items: InterestMapItem[], t: TFunction): SphereCardData[] {
  const sorted = [...items].sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]);
  return sorted.slice(0, 4).map((item) => {
    const base = KNOWN_SPHERE_CODES.has(item.code) ? `results:sphere.${item.code}` : 'results:sphere.fallback';
    return {
      code: item.code,
      title: item.sphere,
      tryNow: t(`${base}.try`),
      observe: t(`${base}.observe`),
    };
  });
}
