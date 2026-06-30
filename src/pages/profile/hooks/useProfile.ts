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
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const clearReport = useResultStore((s) => s.clearReport);

  const displayName = profile?.name?.trim() || user?.name?.trim() || 'Пользователь';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  const hasSubjects =
    (profile?.subjects_like?.length ?? 0) > 0 ||
    (profile?.subjects_dislike?.length ?? 0) > 0 ||
    (profile?.subjects_easy?.length ?? 0) > 0 ||
    (profile?.subjects_hard?.length ?? 0) > 0;

  function handleLogout() {
    clearProfile();
    resetAssessment();
    clearReport();
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
    hasSubjects,
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  };
}
