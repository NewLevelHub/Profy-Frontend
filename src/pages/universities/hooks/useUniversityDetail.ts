import { useCallback } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useFavoriteUniversity } from '@/shared/hooks/useFavoriteUniversity';

/** 404 — такого вуза нет, 422 — id вообще не похож на идентификатор. */
function isMissing(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === 404 || status === 422;
}

export function useUniversityDetail() {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();

  const { data: university, isLoading, error, refetch } = useQuery({
    queryKey: ['university', universityId] as const,
    queryFn: () => universityApi.getDetail(universityId!),
    enabled: !!universityId,
    // Битый id в адресе — это не сбой связи, повторять запрос бессмысленно.
    retry: (failureCount, err) => !isMissing(err) && failureCount < 2,
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
    // Разные ответы требуют разных слов: по несуществующему адресу
    // «Попробуй ещё раз» — обещание, которого экран не может сдержать,
    // сколько ни нажимай. Кнопку повтора страница показывает только там,
    // где повтор действительно может помочь.
    error: error ? (isMissing(error) ? 'not_found' : 'network') : null,
    refetch,
    toggleFavorite,
    handleProgramClick,
  };
}
