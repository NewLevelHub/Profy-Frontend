import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/app/routes';
import type { GapAnalysisState, ProgramParams } from '@/app/routes';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useProgramDetail() {
  const { slug, programId } = useParams<ProgramParams>();
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program', programId] as const,
    queryFn: () => universityApi.getProgramDetail(programId!),
    enabled: !!programId,
  });

  function handleCheckChances() {
    navigate(ROUTES.gapAnalysis(slug!, programId!), {
      state: {
        programName: program?.name,
        universityName: program?.university.name,
      } satisfies GapAnalysisState,
    });
  }

  return {
    program,
    isLoading,
    error: error ? 'Не удалось загрузить программу. Попробуй ещё раз.' : null,
    assessmentId,
    handleCheckChances,
  };
}
