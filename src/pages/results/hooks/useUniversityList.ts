import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { canSeeUniversities } from '@/shared/lib/assessmentGoal';
import { useFavoriteUniversity } from '@/shared/hooks/useFavoriteUniversity';
import type { ProgramBrief } from '@/shared/types';

export interface CountryFilter {
  label: string;
  value: string | undefined;
}

// `ranking` (general, cross-country) and `uniranks_kz_rank` (KZ-only pool)
// are different rating systems with different pools of universities — they
// must never be compared against each other as if they were one scale.
// `uniranks_world_rank` is intentionally not used to decide sort order at
// all here; it's shown as context/label only (see getUniversityRankingLabels
// in programUtils.ts). See university-cards-ux-fix-plan.md §1.
function getGeneralRankScore(p: ProgramBrief): number | null {
  const uni = p.university;
  if (uni.ranking !== null && uni.ranking !== undefined && uni.ranking > 0) {
    return uni.ranking;
  }
  return null;
}

function getKzRankScore(p: ProgramBrief): number | null {
  const uni = p.university;
  if (uni.uniranks_kz_rank !== null && uni.uniranks_kz_rank !== undefined && uni.uniranks_kz_rank > 0) {
    return uni.uniranks_kz_rank;
  }
  return null;
}

// Starred universities lead the list regardless of rank (PRO-265). The
// backend already returns them first, but this hook re-sorts client-side on
// every filter/direction change, so the rule has to be repeated here or the
// re-sort would silently undo it.
function compareByFavorite(a: ProgramBrief, b: ProgramBrief): number {
  if (a.university.is_favorite === b.university.is_favorite) return 0;
  return a.university.is_favorite ? -1 : 1;
}

// Universities with no score on the active scale always sort to the end, as
// their own group, regardless of asc/desc — they must never get silently
// blended into the middle of the ranked list via a fallback score.
function compareByRank(
  a: ProgramBrief,
  b: ProgramBrief,
  getScore: (p: ProgramBrief) => number | null,
  direction: 'asc' | 'desc'
): number {
  const scoreA = getScore(a);
  const scoreB = getScore(b);
  if (scoreA === null && scoreB === null) return 0;
  if (scoreA === null) return 1;
  if (scoreB === null) return -1;
  return direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
}

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isAllowed = canSeeUniversities(goal, ageGroup);
  const { toggleFavorite } = useFavoriteUniversity();

  // Program.profession_slugs directly lists which professions a specialty
  // prepares someone for, so the university search keys off the profession's
  // own slug — no intermediate category to bridge through.
  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug] as const,
    queryFn: () => universityApi.getPrograms(slug!),
    enabled: !!slug && isAllowed,
  });

  // Stable identities: these are passed down through ProgramListSection to
  // every memo'd ProgramCard. A fresh closure each render would defeat the
  // memo and re-render all 50 cards (and re-run their image logic) on any
  // parent update — e.g. a React Query background refetch.
  const handleCountryChange = useCallback((country: string | undefined) => {
    setActiveCountry(country);
    // If country is undefined ('Все'), default to 'asc' (best to worst). Else default to 'desc' (worst to best).
    setSortDirection(country === undefined ? 'asc' : 'desc');
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Only countries actually present in this direction's programs — a static
  // predefined list would show filters with nothing behind them (or miss
  // countries the static list never anticipated).
  const countryFilters = useMemo((): CountryFilter[] => {
    const countries = Array.from(new Set(allPrograms.map(p => p.university.country))).sort((a, b) =>
      a.localeCompare(b, 'ru'),
    );
    return [{ label: 'Все', value: undefined }, ...countries.map(country => ({ label: country, value: country }))];
  }, [allPrograms]);

  const programs = useMemo(() => {
    const filtered = activeCountry
      ? allPrograms.filter(p => p.university.country === activeCountry)
      : allPrograms;

    // Country filter decides which ranking scale is meaningful to sort by:
    // "Все" (no filter) → the general cross-country `ranking`; "Казахстан"
    // → `uniranks_kz_rank`, the only scale that's actually comparable
    // within a KZ-only result set.
    const getScore = activeCountry === 'Казахстан' ? getKzRankScore : getGeneralRankScore;
    return [...filtered].sort(
      (a, b) => compareByFavorite(a, b) || compareByRank(a, b, getScore, sortDirection),
    );
  }, [allPrograms, activeCountry, sortDirection]);

  // Адрес, а не переход: карточка программы рендерит его как обычную ссылку.
  const programDetailPath = useCallback(
    (programId: string) => `/results/directions/${encodeURIComponent(slug!)}/universities/${programId}`,
    [slug],
  );

  return {
    slug,
    programs,
    isLoading,
    error: error ? 'Не удалось загрузить программы. Попробуй ещё раз.' : null,
    activeCountry,
    setActiveCountry: handleCountryChange,
    countryFilters,
    sortDirection,
    toggleSortDirection,
    isAllowed,
    programDetailPath,
    toggleFavorite,
    refetch,
  };
}
