import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useProfileStore } from '@/shared/store/profile';

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

export function useUniversityList() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  const [activeCountry, setActiveCountry] = useState<string | undefined>(undefined);

  const isAllowed = ageGroup === 'senior';

  const { data: allPrograms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['programs', slug] as const,
    queryFn: () => universityApi.getPrograms(slug!),
    enabled: !!slug && isAllowed,
  });

  const programs = useMemo(() => {
    if (!activeCountry) return allPrograms;
    if (activeCountry === '__europe__') return allPrograms.filter(p => EUROPE_COUNTRIES.has(p.university.country));
    if (activeCountry === '__asia__') return allPrograms.filter(p => ASIA_COUNTRIES.has(p.university.country));
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
    isAllowed,
    handleProgramClick,
    refetch,
  };
}
