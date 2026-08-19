import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { canSeeUniversities } from '@/shared/lib/assessmentGoal';

export const COUNTRY_FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Все', value: undefined },
  { label: 'Казахстан', value: 'Казахстан' },
  { label: 'США', value: 'США' },
  { label: 'Великобритания', value: 'Великобритания' },
  { label: 'Европа', value: '__europe__' },
  { label: 'Канада', value: 'Канада' },
  { label: 'Азия', value: '__asia__' },
];

const EUROPE_COUNTRIES = new Set(['Нидерланды', 'Германия', 'Швейцария', 'Франция', 'Италия', 'Испания', 'Польша', 'Чехия', 'Австрия', 'Бельгия', 'Португалия', 'Швеция', 'Норвегия', 'Дания', 'Финляндия']);
const ASIA_COUNTRIES = new Set(['Сингапур', 'Южная Корея', 'Япония', 'Китай', 'Индия', 'Малайзия', 'Гонконг']);

function getProgramRankScore(p: any): number {
  const uni = p.university;
  if (uni.ranking !== null && uni.ranking !== undefined && uni.ranking > 0) {
    return uni.ranking;
  }
  if (uni.uniranks_kz_rank !== null && uni.uniranks_kz_rank !== undefined && uni.uniranks_kz_rank > 0) {
    return uni.uniranks_kz_rank;
  }
  if (uni.uniranks_world_rank !== null && uni.uniranks_world_rank !== undefined && uni.uniranks_world_rank > 0) {
    return uni.uniranks_world_rank;
  }
  return 9999999;
}

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isAllowed = canSeeUniversities(goal, ageGroup);

  // Program.profession_slugs directly lists which professions a specialty
  // prepares someone for, so the university search keys off the profession's
  // own slug — no intermediate category to bridge through.
  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug] as const,
    queryFn: () => universityApi.getPrograms(slug!),
    enabled: !!slug && isAllowed,
  });

  const handleCountryChange = (country: string | undefined) => {
    setActiveCountry(country);
    // If country is undefined ('Все'), default to 'asc' (best to worst). Else default to 'desc' (worst to best).
    setSortDirection(country === undefined ? 'asc' : 'desc');
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const programs = useMemo(() => {
    let filtered = allPrograms;
    if (activeCountry === '__europe__') {
      filtered = allPrograms.filter(p => EUROPE_COUNTRIES.has(p.university.country));
    } else if (activeCountry === '__asia__') {
      filtered = allPrograms.filter(p => ASIA_COUNTRIES.has(p.university.country));
    } else if (activeCountry) {
      filtered = allPrograms.filter(p => p.university.country === activeCountry);
    }

    return [...filtered].sort((a, b) => {
      const scoreA = getProgramRankScore(a);
      const scoreB = getProgramRankScore(b);
      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [allPrograms, activeCountry, sortDirection]);

  function handleProgramClick(programId: string) {
    navigate(`/results/directions/${encodeURIComponent(slug!)}/universities/${programId}`);
  }

  return {
    slug,
    programs,
    isLoading,
    error: error ? 'Не удалось загрузить программы. Попробуй ещё раз.' : null,
    activeCountry,
    setActiveCountry: handleCountryChange,
    sortDirection,
    toggleSortDirection,
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
