import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useProgramDetail() {
  const { slug, programId } = useParams<{ slug: string; programId: string }>();
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program', programId] as const,
    queryFn: () => universityApi.getProgramDetail(programId!),
    enabled: !!programId,
  });

  return {
    program,
    isLoading,
    error: error ? 'Не удалось загрузить программу. Попробуй ещё раз.' : null,
    assessmentId,
  };
}
