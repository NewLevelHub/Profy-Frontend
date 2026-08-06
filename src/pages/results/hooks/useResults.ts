import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { resultApi } from '@/shared/api/result';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { RIASEC_TYPES, PERSONALITY_ORDER } from '@/shared/config/constants';
import type { HollandType, ThinkingStyle, PersonalityTrait } from '@/shared/types';

export function useResults() {
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['result', assessmentId] as const,
    queryFn: async () => {
      try {
        return await resultApi.get(assessmentId!);
      } catch (err) {
        if ((err as AxiosError)?.response?.status === 404) {
          return await resultApi.generate(assessmentId!);
        }
        throw err;
      }
    },
    enabled: hasCompletedAssessment && !report && !!assessmentId,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

  // Stale assessmentId from a previous user's session — clear it
  const is403 = (error as AxiosError | null)?.response?.status === 403;
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  const effectiveReport = report ?? data ?? null;

  const profileEntries: [HollandType, number][] = RIASEC_TYPES.map(letter => [
    letter,
    effectiveReport?.profile?.[letter] ?? 0,
  ]);

  const thinkingStyleEntries = Object.entries(
    effectiveReport?.thinking_style ?? {},
  ) as [keyof ThinkingStyle, number][];

  const motivationHighlights = effectiveReport?.motivation_highlights ?? [];

  const personalityEntries = (PERSONALITY_ORDER as PersonalityTrait[]).map(trait => [
    trait,
    effectiveReport?.personality_profile?.[trait] ?? 0,
  ] as [PersonalityTrait, number]);
  const personalityNotes = effectiveReport?.personality_notes ?? ({} as Record<PersonalityTrait, string>);

  return {
    report: effectiveReport,
    isLoading: isLoading && !effectiveReport,
    error: (!is403 && error) ? 'Не удалось загрузить результаты. Попробуй ещё раз.' : null,
    hasCompletedAssessment,
    goal,
    ageGroup,
    showUniversityBtn: goal === 'university' && ageGroup === 'senior',
    profileEntries,
    thinkingStyleEntries,
    motivationHighlights,
    personalityEntries,
    personalityNotes,
    refetch,
  };
}
