import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { developmentPlanApi } from '@/shared/api/developmentPlan';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { DevelopmentPlanResponse } from '@/shared/types';

export type PlanErrorKind = 'ai_unavailable' | 'forbidden' | 'no_result' | 'generic';

const ERROR_MESSAGES: Record<PlanErrorKind, string> = {
  ai_unavailable: 'ИИ временно недоступен. Попробуй ещё раз — план не потеряется.',
  forbidden: 'Эта возможность доступна для 9–11 классов.',
  no_result: 'Сначала пройди тест и выбери программу — план строится по ним.',
  generic: 'Не удалось собрать план. Попробуй ещё раз.',
};

function errorKind(err: unknown): PlanErrorKind {
  const status = (err as AxiosError)?.response?.status;
  if (status === 503) return 'ai_unavailable';
  if (status === 403) return 'forbidden';
  if (status === 409) return 'no_result';
  return 'generic';
}

interface NavState {
  /** Set when arriving from the "Собрать план развития" button — generate at once. */
  generate?: boolean;
}

export function useDevelopmentPlan() {
  const { programId = '' } = useParams<{ slug: string; programId: string }>();
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const queryClient = useQueryClient();
  const { state } = useLocation() as { state: NavState | null };

  const queryKey = ['development-plan', assessmentId, programId] as const;

  const planQuery = useQuery({
    queryKey,
    queryFn: () => developmentPlanApi.get(assessmentId!, programId),
    enabled: !!assessmentId && !!programId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status;
      if (status && [400, 403, 404, 409].includes(status)) return false;
      return failureCount < 1;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => developmentPlanApi.generate(assessmentId!, programId),
    onSuccess: (data: DevelopmentPlanResponse) => queryClient.setQueryData(queryKey, data),
  });

  const plan = planQuery.data ?? null;
  const loadStatus = (planQuery.error as AxiosError | null)?.response?.status;
  const notGenerated = loadStatus === 404;

  const generate = useCallback(() => {
    if (assessmentId && programId && !generateMutation.isPending) generateMutation.mutate();
  }, [assessmentId, programId, generateMutation]);

  const autoFired = useRef(false);
  useEffect(() => {
    if (!state?.generate || autoFired.current) return;
    if (!notGenerated || !assessmentId || !programId) return;
    autoFired.current = true;
    generateMutation.mutate();
  }, [state?.generate, notGenerated, assessmentId, programId, generateMutation]);

  const failure = generateMutation.error ?? (notGenerated ? null : planQuery.error);
  const kind = failure ? errorKind(failure) : null;

  return {
    plan,
    isLoading: planQuery.isLoading && !plan,
    isGenerating: generateMutation.isPending,
    notGenerated: notGenerated && !generateMutation.isPending && !generateMutation.isError,
    errorKind: kind,
    errorMessage: kind ? ERROR_MESSAGES[kind] : null,
    generate,
  };
}
