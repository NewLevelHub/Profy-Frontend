import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '@/shared/api/feedback';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { useToastStore } from '@/shared/store/toast';
import type { FeedbackRating } from '@/shared/types';

// Same context + query key as the roadmap page's own feedback prompt (see
// useDirectionRoadmap.ts) — one submission here also satisfies that one, so
// the student never gets asked twice for the same assessment.
const FEEDBACK_CONTEXT = 'roadmap';

export const FEEDBACK_ASPECTS = [
  { key: 'questions', title: 'Вопросы теста', hint: 'Понятные и не затянутые — легко было отвечать' },
  { key: 'result', title: 'Результат', hint: 'Направление и описание похожи на тебя' },
  { key: 'plan', title: 'План развития', hint: 'Понятно, что делать дальше' },
  { key: 'design', title: 'Дизайн и удобство', hint: 'Приятно пользоваться, всё находится' },
] as const;

export type FeedbackAspectKey = typeof FEEDBACK_ASPECTS[number]['key'];

export const FEEDBACK_FIT_OPTIONS = ['Да, подходит', 'Частично', 'Не моё'] as const;
export type FeedbackFit = typeof FEEDBACK_FIT_OPTIONS[number];

export const OVERALL_FACES = ['😞', '😕', '😐', '🙂', '🤩'];
const OVERALL_LABELS = ['', 'Совсем не то', 'Так себе', 'Нормально', 'Хорошо', 'Очень нравится!'];

// The design's 1-5 scales map onto the backend's 3-tier good/neutral/bad
// enum (see ProductFeedbackCreateRequest in profi-backend) — 1-2 bad, 3
// neutral, 4-5 good, same split the existing FeedbackSurveyModal star labels
// already use.
function toRating(score: number): FeedbackRating {
  if (score <= 2) return 'bad';
  if (score === 3) return 'neutral';
  return 'good';
}

export function useResultFeedback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const report = useResultStore(s => s.report);

  const [overall, setOverall] = useState(0);
  const [aspectScores, setAspectScores] = useState<Partial<Record<FeedbackAspectKey, number>>>({});
  const [fit, setFit] = useState<FeedbackFit | null>(null);
  const [comment, setComment] = useState('');
  const [editingOverride, setEditingOverride] = useState(false);

  useEffect(() => {
    if (!report) navigate('/results', { replace: true });
  }, [report, navigate]);

  const statusKey = ['roadmap-feedback-status', assessmentId, FEEDBACK_CONTEXT] as const;
  const statusQuery = useQuery({
    queryKey: statusKey,
    queryFn: () => feedbackApi.getStatus(assessmentId!, FEEDBACK_CONTEXT),
    enabled: !!assessmentId,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const message =
        fit && comment.trim()
          ? `Направление подходит: ${fit}. ${comment.trim()}`
          : fit
            ? `Направление подходит: ${fit}.`
            : comment.trim() || null;

      return feedbackApi.submit({
        context: FEEDBACK_CONTEXT,
        overall_rating: toRating(overall),
        questions_rating: aspectScores.questions != null ? toRating(aspectScores.questions) : null,
        result_match_rating: aspectScores.result != null ? toRating(aspectScores.result) : null,
        plan_usefulness_rating: aspectScores.plan != null ? toRating(aspectScores.plan) : null,
        design_rating: aspectScores.design != null ? toRating(aspectScores.design) : null,
        message,
        assessment_id: assessmentId,
        direction_slug: report?.direction_slug ?? null,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(statusKey, { submitted: true });
      useToastStore.getState().show('Спасибо! Это правда помогает');
      setEditingOverride(false);
    },
  });

  const alreadySubmitted = statusQuery.data?.submitted === true;
  const sent = !editingOverride && (mutation.isSuccess || alreadySubmitted);

  return {
    report,
    editing: !sent,
    sent,
    overall,
    setOverall,
    overallFace: OVERALL_FACES,
    overallLabel: OVERALL_LABELS[overall] || 'Выбери оценку',
    aspects: FEEDBACK_ASPECTS,
    aspectScores,
    setAspectScore: (key: FeedbackAspectKey, score: number) =>
      setAspectScores(prev => ({ ...prev, [key]: score })),
    fit,
    setFit,
    comment,
    setComment,
    canSend: overall > 0,
    isPending: mutation.isPending,
    onSend: () => {
      if (overall > 0 && !mutation.isPending) mutation.mutate();
    },
    onEdit: () => setEditingOverride(true),
    toResult: () => navigate('/results'),
    toPlan: () =>
      report
        ? navigate(`/results/directions/${encodeURIComponent(report.direction_slug)}/roadmap`)
        : navigate('/results'),
  };
}
