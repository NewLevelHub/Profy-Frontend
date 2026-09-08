import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useFavoriteUniversity } from '@/shared/hooks/useFavoriteUniversity';

export function useUniversityDetail() {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();

  const { data: university, isLoading, error, refetch } = useQuery({
    queryKey: ['university', universityId] as const,
    queryFn: () => universityApi.getDetail(universityId!),
    enabled: !!universityId,
  });

  const { toggleFavorite } = useFavoriteUniversity();

  // Program detail already has a page under the results feature; it is keyed
  // by a direction slug purely because that's the route it was built for, so
  // the program's own first profession slug is what we hand it rather than
  // duplicating the screen here.
  const handleProgramClick = useCallback(
    (programId: string, professionSlug: string | undefined) => {
      if (!professionSlug) return;
      navigate(
        `/results/directions/${encodeURIComponent(professionSlug)}/universities/${programId}`,
      );
    },
    [navigate],
  );

  return {
    university,
    isLoading,
    error: error ? 'Не удалось загрузить университет. Попробуй ещё раз.' : null,
    refetch,
    toggleFavorite,
    handleProgramClick,
  };
}
