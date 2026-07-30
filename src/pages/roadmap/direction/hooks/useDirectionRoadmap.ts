import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ROUTES } from '@/app/routes';
import type { DirectionRoadmapState } from '@/app/routes';
import { directionRoadmapApi } from '@/shared/api/directionRoadmap';
import { feedbackApi } from '@/shared/api/feedback';
import { subjectReadinessApi } from '@/shared/api/subjectReadiness';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useTypedLocationState } from '@/shared/hooks/useTypedLocationState';
import type { DirectionRoadmapResponse } from '@/shared/types';

// Same context + query key as the dedicated feedback page (see
// useResultFeedback.ts) — one submission there satisfies this check too, so
// a student who already rated the result never gets pulled into the
// feedback page again from here.
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

export function useDirectionRoadmap(slug: string) {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const setRoadmap = useDirectionRoadmapStore(s => s.setRoadmap);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const state = useTypedLocationState<DirectionRoadmapState>();

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

  const subjectReadinessQuery = useQuery({
    queryKey: ['subject-readiness-result', assessmentId] as const,
    queryFn: () => subjectReadinessApi.getResult(assessmentId!),
    enabled: !!assessmentId && !!roadmap,
    retry: false,
  });

  const feedbackStatusKey = ['roadmap-feedback-status', assessmentId, FEEDBACK_CONTEXT] as const;
  const feedbackStatusQuery = useQuery({
    queryKey: feedbackStatusKey,
    queryFn: () => feedbackApi.getStatus(assessmentId!, FEEDBACK_CONTEXT),
    enabled: !!assessmentId && !!roadmap,
    staleTime: Infinity,
  });
  const showFeedbackPrompt = feedbackStatusQuery.data?.submitted === false;

  // Once the student scrolls to the bottom of a generated plan (and hasn't
  // rated the result yet for this assessment), send them straight to the
  // dedicated feedback page — one-shot per mount so re-crossing the sentinel
  // during the same visit doesn't re-navigate.
  const feedbackSentinelRef = useRef<HTMLDivElement | null>(null);
  const feedbackNavigatedRef = useRef(false);
  useEffect(() => {
    if (!showFeedbackPrompt || feedbackNavigatedRef.current) return;
    const el = feedbackSentinelRef.current;
    if (!el) return;

    // AppLayout scrolls inside its own overflow-y-auto pane, not the
    // document — an observer with the default (viewport) root can end up
    // treating the sentinel as already visible the instant it's observed,
    // firing before the student has scrolled at all. Use the real scroll
    // container as root instead.
    let scroller: HTMLElement | null = el.parentElement;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement;
    }

    const triggerNavigate = () => {
      if (feedbackNavigatedRef.current) return;
      feedbackNavigatedRef.current = true;
      navigate(ROUTES.resultFeedback(slug));
    };

    // A short plan that already fits on screen has nothing to scroll —
    // its intersection state will never change, so the observer below
    // would never fire. Nothing left to scroll to counts as "reached the
    // bottom" already.
    if (scroller && scroller.scrollHeight <= scroller.clientHeight + 1) {
      triggerNavigate();
      return;
    }

    // IntersectionObserver's first callback always reports the state at
    // observe()-time, not a scroll-triggered change — skip it so a plan
    // that happens to render with the sentinel already in view doesn't
    // fire instantly on mount.
    let isFirstCallback = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isFirstCallback) {
          isFirstCallback = false;
          return;
        }
        if (entry.isIntersecting) triggerNavigate();
      },
      { root: scroller, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showFeedbackPrompt, roadmap, navigate, slug]);

  return {
    roadmap,
    isLoading: roadmapQuery.isLoading && !roadmap,
    isGenerating: generateMutation.isPending,
    /** No plan yet and nothing is running — show the "build my plan" CTA. */
    notGenerated: notGenerated && !generateMutation.isPending && !generateMutation.isError,
    errorKind: kind,
    errorMessage: kind ? ERROR_MESSAGES[kind] : null,
    generate,
    feedbackSentinelRef,
    subjectScores: subjectReadinessQuery.data?.subject_scores ?? [],
  };
}
