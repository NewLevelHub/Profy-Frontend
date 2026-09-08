import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useLocaleStore } from '@/shared/store/locale';
import { canSeeUniversities } from '@/shared/lib/assessmentGoal';
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
  const { t } = useTranslation('results');
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isAllowed = canSeeUniversities(goal, ageGroup);
  // Program/university `name` and `description` are resolved server-side per
  // request locale (Accept-Language, set by the api interceptor from this same
  // store). Without locale in the key, switching language serves the stale
  // cached response — the localized names only appeared after a reload.
  const locale = useLocaleStore(s => s.locale);

  // Program.profession_slugs directly lists which professions a specialty
  // prepares someone for, so the university search keys off the profession's
  // own slug — no intermediate category to bridge through.
  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug, locale] as const,
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
    return [{ label: t('programList.allCountries'), value: undefined }, ...countries.map(country => ({ label: country, value: country }))];
  }, [allPrograms, t]);

  const programs = useMemo(() => {
    const filtered = activeCountry
      ? allPrograms.filter(p => p.university.country === activeCountry)
      : allPrograms;

    // Country filter decides which ranking scale is meaningful to sort by:
    // no filter → the general cross-country `ranking`; KZ → `uniranks_kz_rank`,
    // the only scale that's actually comparable within a KZ-only result set.
    // `activeCountry` holds a backend `country` value (ru-only data), so the
    // literal here is a data match, not UI copy.
    const getScore = activeCountry === 'Казахстан' ? getKzRankScore : getGeneralRankScore;
    return [...filtered].sort((a, b) => compareByRank(a, b, getScore, sortDirection));
  }, [allPrograms, activeCountry, sortDirection]);

  const handleProgramClick = useCallback((programId: string) => {
    navigate(`/results/directions/${encodeURIComponent(slug!)}/universities/${programId}`);
  }, [navigate, slug]);

  return {
    slug,
    programs,
    isLoading,
    error: error ? t('error.loadPrograms') : null,
    activeCountry,
    setActiveCountry: handleCountryChange,
    countryFilters,
    sortDirection,
    toggleSortDirection,
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
