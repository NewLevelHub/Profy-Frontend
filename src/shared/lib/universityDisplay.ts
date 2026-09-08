import type { UniversityBrief } from '@/shared/types';

// Display helpers for a university, shared by the results-side program cards
// and the standalone /universities catalogue (PRO-265). They live in shared/
// rather than under pages/results because two features render the same
// university chrome — a cross-feature `pages/* -> pages/*` import would be
// the alternative, and the project layout does not allow that.

/**
 * The card grid shows `university.image_url` in a ~380x128 box, but that URL
 * points at the full export (up to 1600px / ~2 MP). Compositing a dozen of
 * those per scroll tick is what makes the list stutter. `scripts/
 * generate_card_thumbnails.py` writes a `<slug>.card.webp` variant (~560px)
 * next to every `<slug>.webp`; this rewrites the URL to ask for it. The
 * caller must keep the original as an onError fallback so a missing variant
 * (thumbnail script not yet run, or a future S3 backend) degrades to the
 * full image instead of a broken one. When the API grows a real
 * `card_image_url` field, delete this and read the field.
 */
export function cardImageUrl(imageUrl: string): string {
  return imageUrl.replace(/\/universities\/([^/]+)\.webp$/, '/universities/$1.card.webp');
}

/** Shared cost line for university/program cards (`1659 $/год`). */
export function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  // `cost` sometimes arrives as a numeric-looking string (Decimal fields can
  // survive JSON as strings), and `"1659".toLocaleString()` is a no-op on a
  // string — coercing to Number first is what actually applies grouping.
  return `${Number(cost).toLocaleString('ru-RU')} $/год`;
}

/**
 * One ranking chip, in a single unified shape for every university, so a card
 * never shows two differently-worded rank numbers side by side (the old code
 * could render "#8 (QS World Rankings 2026)" from `ranking_label` next to
 * "#12 в мире (UNIRANKS)" from `uniranks_world_rank` — two global ranks on two
 * incomparable scales, written two different ways).
 *
 * Product rule (chosen 2026-08-28, revised 2026-09-02): every displayed
 * number comes from ONE rating system, UniRanks Global Rank, so the chips
 * are comparable across universities. The consolidated backend now writes
 * that single number into `University.ranking` for every university it has
 * (see scripts/build_world_rank_map.py); `uniranks_world_rank` /
 * `uniranks_kz_rank` / the free-text `ranking_label` are no longer populated
 * by the pipeline and are only read here as legacy fallbacks. Every chip is
 * "UniRanks · #N в мире" — no per-country rank exists any more, and the
 * "QS World" label was wrong (that field never held a QS number after the
 * revision).
 *
 * Returns an array (0 or 1 entries) so the existing call sites
 * (UniversityRankBadges, ProgramDetailPage) don't need to change shape.
 */
export function getUniversityRankingLabels(
  uni: Pick<UniversityBrief, 'country' | 'ranking' | 'uniranks_kz_rank' | 'uniranks_world_rank'>
): string[] {
  const positive = (v: number | null | undefined): number | null =>
    v !== null && v !== undefined && v > 0 ? v : null;

  // `ranking` is the current single source (UniRanks Global Rank); the other
  // two are legacy and normally null.
  const worldRank = positive(uni.ranking) ?? positive(uni.uniranks_world_rank);
  const kzRank = positive(uni.uniranks_kz_rank);

  if (kzRank !== null) return [`UniRanks · #${kzRank} в Казахстане`];
  if (worldRank !== null) return [`UniRanks · #${worldRank} в мире`];
  return [];
}
