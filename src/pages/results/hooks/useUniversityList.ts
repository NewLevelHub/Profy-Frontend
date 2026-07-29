import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useProfileStore } from '@/shared/store/profile';

export const CITY_FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Все', value: undefined },
  { label: 'Алматы', value: 'Алматы' },
  { label: 'Астана', value: 'Астана' },
];

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCity, setActiveCity] = useState<string | undefined>(undefined);

  const isAllowed = ageGroup === 'senior';

  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug] as const,
    queryFn: () => universityApi.getPrograms(slug!),
    enabled: !!slug && isAllowed,
  });

  const programs = useMemo(() => {
    if (!activeCity) return allPrograms;
    return allPrograms.filter(p => p.university.city === activeCity);
  }, [allPrograms, activeCity]);

  function handleProgramClick(programId: string) {
    navigate(`/results/directions/${encodeURIComponent(slug!)}/universities/${programId}`);
  }

  return {
    slug,
    programs,
    isLoading,
    error: error ? 'Не удалось загрузить программы. Попробуй ещё раз.' : null,
    activeCity,
    setActiveCity,
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
