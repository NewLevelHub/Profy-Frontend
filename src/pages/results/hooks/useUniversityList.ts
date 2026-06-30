import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';

export const COUNTRY_FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Все', value: undefined },
  { label: 'Казахстан', value: 'Kazakhstan' },
  { label: 'США', value: 'us' },
  { label: 'Великобритания', value: 'uk' },
  { label: 'Европа', value: 'Europe' },
  { label: 'Канада', value: 'Canada' },
  { label: 'Азия', value: 'Asia' },
];

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);

  const isAllowed = goal === 'university' && ageGroup === 'senior';

  const { data: programs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug, activeCountry] as const,
    queryFn: () => universityApi.getPrograms(slug!, activeCountry),
    enabled: !!slug && isAllowed,
  });

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
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
