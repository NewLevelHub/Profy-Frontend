import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { directionRoadmapApi } from '@/shared/api/directionRoadmap';
import { feedbackApi } from '@/shared/api/feedback';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useToastStore } from '@/shared/store/toast';
import type { DirectionRoadmapResponse, FeedbackRating } from '@/shared/types';

const FEEDBACK_CONTEXT = 'roadmap';

/** What went wrong, so the page can offer the right way out. */
export type RoadmapErrorKind = 'ai_unavailable' | 'wrong_direction' | 'forbidden' | 'generic';

function errorKind(err: unknown): RoadmapErrorKind {
  const status = (err as AxiosError)?.response?.status;
  if (status === 503) return 'ai_unavailable';
  // 400 now means "not the direction you confirmed in the test" (see
  // roadmap_builder._require_direction_roadmap_access) — the akinator
  // inquiry step this used to mean was removed with the old block flow.
  if (status === 400) return 'wrong_direction';
  if (status === 403) return 'forbidden';
  return 'generic';
}

const ERROR_MESSAGES: Record<RoadmapErrorKind, string> = {
  ai_unavailable: 'ИИ временно недоступен. Попробуй ещё раз — план не потеряется.',
  wrong_direction: 'Сначала заверши тест и выбери направление.',
  forbidden: 'Эта возможность пока недоступна для твоего возраста.',
  generic: 'Не удалось составить план. Попробуй ещё раз.',
};

interface NavigationState {
  /** Set when arriving straight from the inquiry verdict — start generating at once. */
  generate?: boolean;
}

export function useDirectionRoadmap(slug: string) {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const setRoadmap = useDirectionRoadmapStore(s => s.setRoadmap);
  const queryClient = useQueryClient();
  const { state } = useLocation() as { state: NavigationState | null };

  const queryKey = ['direction-roadmap', assessmentId, slug] as const;

  const roadmapQuery = useQuery({
    queryKey,
    queryFn: () => directionRoadmapApi.get(assessmentId!, slug),
    enabled: !!assessmentId && !!slug,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status;
      if (status === 404 || status === 403 || status === 400) return false;
      return failureCount < 1;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => directionRoadmapApi.generate(assessmentId!, slug),
    onSuccess: (data: DirectionRoadmapResponse) => {
      queryClient.setQueryData(queryKey, data);
      setRoadmap(data);
    },
  });

  const roadmap = roadmapQuery.data ?? null;
  const loadStatus = (roadmapQuery.error as AxiosError | null)?.response?.status;
  const notGenerated = loadStatus === 404;

  const generate = useCallback(() => {
    if (assessmentId && !generateMutation.isPending) generateMutation.mutate();
  }, [assessmentId, generateMutation]);

  // Coming from the verdict screen: generate immediately instead of showing a CTA.
  const autoGenerateFired = useRef(false);
  useEffect(() => {
    if (!state?.generate || autoGenerateFired.current) return;
    if (!notGenerated || !assessmentId) return;
    autoGenerateFired.current = true;
    generateMutation.mutate();
  }, [state?.generate, notGenerated, assessmentId, generateMutation]);

  // Keep the store in sync when the plan comes from the query cache, not the mutation.
  useEffect(() => {
    if (roadmap) setRoadmap(roadmap);
  }, [roadmap, setRoadmap]);

  const failure = generateMutation.error ?? (notGenerated ? null : roadmapQuery.error);
  const kind = failure ? errorKind(failure) : null;

  const feedbackStatusKey = ['roadmap-feedback-status', assessmentId, FEEDBACK_CONTEXT] as const;

  const feedbackStatusQuery = useQuery({
    queryKey: feedbackStatusKey,
    queryFn: () => feedbackApi.getStatus(assessmentId!, FEEDBACK_CONTEXT),
    enabled: !!assessmentId && !!roadmap,
    staleTime: Infinity,
  });

  const feedbackMutation = useMutation({
    mutationFn: (input: { rating: FeedbackRating; message: string | null }) =>
      feedbackApi.submit({
        context: FEEDBACK_CONTEXT,
        rating: input.rating,
        message: input.message,
        assessment_id: assessmentId,
        direction_slug: slug,
      }),
    onSuccess: () => {
      queryClient.setQueryData(feedbackStatusKey, { submitted: true });
      useToastStore.getState().show('Спасибо! Нам очень важно ваше мнение!');
    },
  });

  const submitFeedback = useCallback(
    (rating: FeedbackRating, message: string | null) => {
      if (feedbackMutation.isPending) return;
      feedbackMutation.mutate({ rating, message });
    },
    [feedbackMutation],
  );

  return {
    roadmap,
    isLoading: roadmapQuery.isLoading && !roadmap,
    isGenerating: generateMutation.isPending,
    /** No plan yet and nothing is running — show the "build my plan" CTA. */
    notGenerated: notGenerated && !generateMutation.isPending && !generateMutation.isError,
    errorKind: kind,
    errorMessage: kind ? ERROR_MESSAGES[kind] : null,
    generate,
    submitFeedback,
    feedbackPending: feedbackMutation.isPending,
    /** Only true once we've confirmed (from the server) this assessment hasn't given feedback yet. */
    showFeedbackPrompt: feedbackStatusQuery.data?.submitted === false,
  };
}
