import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useProgramDetail() {
  const { programId } = useParams<{ slug: string; programId: string }>();
  const { t } = useTranslation('results');
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program', programId] as const,
    queryFn: () => universityApi.getProgramDetail(programId!),
    enabled: !!programId,
  });

  return {
    program,
    isLoading,
    error: error ? t('error.loadProgram') : null,
    assessmentId,
  };
}
