import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { canSeeUniversities } from '@/shared/lib/assessmentGoal';

export interface CountryFilter {
  label: string;
  value: string | undefined;
}

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);

  const isAllowed = canSeeUniversities(goal, ageGroup);

  // Program.profession_slugs directly lists which professions a specialty
  // prepares someone for, so the university search keys off the profession's
  // own slug — no intermediate category to bridge through.
  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug] as const,
    queryFn: () => universityApi.getPrograms(slug!),
    enabled: !!slug && isAllowed,
  });

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
    if (!activeCountry) return allPrograms;
    return allPrograms.filter(p => p.university.country === activeCountry);
  }, [allPrograms, activeCountry]);

  function handleProgramClick(programId: string) {
    navigate(`/results/directions/${encodeURIComponent(slug!)}/universities/${programId}`);
  }

  return {
    slug,
    programs,
    isLoading,
    error: error ? 'Не удалось загрузить программы. Попробуй ещё раз.' : null,
    activeCountry,
    setActiveCountry,
    countryFilters,
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
