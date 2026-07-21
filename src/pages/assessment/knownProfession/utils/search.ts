import type { DirectionBrief, DirectionTreeNode } from '@/shared/types';

/** One matched specialty, tagged with which sphere it lives in and — if the
 * match came from a job title rather than the specialty's own name —
 * which profession string matched. */
export interface SpecialtySearchMatch {
  sphereSlug: string;
  sphereName: string;
  specialty: DirectionBrief;
  matchedProfession: string | null;
}

interface SpecialtyMatch {
  matched: boolean;
  matchedProfession: string | null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** `normalizedQuery` must already be normalize()'d — callers own that so a
 * multi-specialty scan doesn't re-normalize the same query on every item. */
function matchSpecialty(specialty: DirectionBrief, normalizedQuery: string): SpecialtyMatch {
  if (normalize(specialty.name).includes(normalizedQuery)) {
    return { matched: true, matchedProfession: null };
  }
  if (specialty.label_junior && normalize(specialty.label_junior).includes(normalizedQuery)) {
    return { matched: true, matchedProfession: null };
  }
  const profession = specialty.professions.find(p => normalize(p).includes(normalizedQuery));
  if (profession) {
    return { matched: true, matchedProfession: profession };
  }
  return { matched: false, matchedProfession: null };
}

/** Filters one sphere's specialties by name/label_junior/professions[].
 * Empty query is a no-op passthrough (every specialty, no match reason). */
export function filterSpecialties(
  specialties: DirectionBrief[],
  query: string,
): Array<{ specialty: DirectionBrief; matchedProfession: string | null }> {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return specialties.map(specialty => ({ specialty, matchedProfession: null }));
  }
  return specialties
    .map(specialty => ({ specialty, ...matchSpecialty(specialty, normalizedQuery) }))
    .filter(result => result.matched)
    .map(({ specialty, matchedProfession }) => ({ specialty, matchedProfession }));
}

/** Cross-sphere search across the whole akinator tree. Empty query returns
 * no results (callers should fall back to the normal sphere/list browse UI). */
export function searchTree(tree: DirectionTreeNode[], query: string): SpecialtySearchMatch[] {
  if (!normalize(query)) return [];

  const results: SpecialtySearchMatch[] = [];
  for (const sphere of tree) {
    for (const { specialty, matchedProfession } of filterSpecialties(sphere.professions, query)) {
      results.push({ sphereSlug: sphere.slug, sphereName: sphere.name, specialty, matchedProfession });
    }
  }
  return results;
}
