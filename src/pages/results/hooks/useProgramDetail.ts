import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useLocaleStore } from '@/shared/store/locale';

export function useProgramDetail() {
  const { programId } = useParams<{ slug: string; programId: string }>();
  const { t } = useTranslation('results');
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  // Locale in the key so a language switch refetches — `name` / `description` /
  // `who_its_for` are resolved server-side by request locale (KZ-501/206).
  const locale = useLocaleStore(s => s.locale);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program', programId, locale] as const,
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
