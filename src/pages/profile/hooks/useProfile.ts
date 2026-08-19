import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';

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
  // Sourced straight off the profile the store already fetched (GET /profile
  // returns artifacts embedded) rather than a separate request.
  const artifacts = profile?.artifacts ?? [];

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
    profile,
    displayName,
    initial,
    isJunior,
    hasSubjects,
    artifacts,
    strengthCards: report?.strength_cards ?? [],
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  };
}
