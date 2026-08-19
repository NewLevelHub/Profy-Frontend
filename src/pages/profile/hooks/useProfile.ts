import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { artifactsApi } from '@/shared/api/artifacts';

export function useProfile() {
  const navigate = useNavigate();
  const [confirmRestart, setConfirmRestart] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const clearReport = useResultStore((s) => s.clearReport);
  // Passive read only — the profile page never triggers a report
  // generate/fetch as a side effect of just being viewed (that belongs to
  // /results). If nothing's been completed yet, the junior strengths section
  // shows a real empty state instead.
  const report = useResultStore((s) => s.report);

  const displayName = profile?.name?.trim() || user?.name?.trim() || 'Пользователь';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  // Only two real layout variants exist per spec — 'junior' (under-12,
  // "Мои штуки") vs. everyone else (full account). There's no third variant
  // described for 'middle' (11-14), so it renders the full/senior layout —
  // a judgment call, not a documented product decision.
  const isJunior = profile?.age_group === 'junior';

  const hasSubjects =
    (profile?.subjects_liked?.length ?? 0) > 0 ||
    (profile?.subjects_disliked?.length ?? 0) > 0 ||
    (profile?.subjects_easy?.length ?? 0) > 0 ||
    (profile?.subjects_hard?.length ?? 0) > 0;

  // Onboarding's "Твои увлечения и цели" step — surfaced here too so it can
  // be changed or filled in later (not just once, during onboarding).
  const { data: artifacts } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () =>
      artifactsApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return [];
        throw err;
      }),
    enabled: Boolean(profile) && !isJunior,
    retry: false,
  });

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleRestartRequest() {
    setConfirmRestart(true);
  }

  function handleRestartConfirm() {
    resetAssessment();
    clearReport();
    setConfirmRestart(false);
    navigate('/assessment/goal', { state: { fromRestart: true } });
  }

  function handleRestartCancel() {
    setConfirmRestart(false);
  }

  return {
    user,
    profile,
    displayName,
    initial,
    isJunior,
    hasSubjects,
    artifacts: artifacts ?? [],
    strengthCards: report?.strength_cards ?? [],
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  };
}
