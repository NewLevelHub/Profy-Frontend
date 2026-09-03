import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { useOnboardingDraftStore } from '@/pages/onboarding/onboardingDraftStore';
import type { IdentityRailSection } from '../sections/IdentityRail';

export function useProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation('profile');
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
  const setProfileDraft = useOnboardingDraftStore((s) => s.setProfileDraft);

  const displayName = profile?.name?.trim() || user?.name?.trim() || t('page.defaultName');
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

  // Same sourcing as `artifacts` above — GET /profile embeds certificates
  // and gpa_value/gpa_scale directly, no separate fetch needed.
  const certificates = profile?.certificates ?? [];
  const gpaValue = profile?.gpa_value ?? null;
  const gpaScale = profile?.gpa_scale ?? null;
  const hasCertificates = certificates.length > 0 || (gpaValue != null && gpaScale != null);

  const railSections: IdentityRailSection[] = profile
    ? [
        { id: 'personal', number: '01', label: t('rail.personal') },
        ...(hasSubjects ? [{ id: 'subjects', number: '02', label: t('rail.subjects') }] : []),
        { id: 'artifacts', number: '03', label: t('rail.artifacts') },
        { id: 'certificates', number: '04', label: t('rail.certificates'), status: hasCertificates ? undefined : '—' },
        { id: 'settings', number: '05', label: t('rail.settings') },
      ]
    : [];

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

  function handleEditPersonal() {
    navigate('/onboarding/profile');
  }

  function handleEditSubjects() {
    navigate('/onboarding/profile', { state: { resumeAtLastStep: true } });
  }

  // "Изменить"/"Добавить" on artifacts used to drop straight onto the
  // standalone tabbed editor. Parking a draft here first makes
  // useArtifactsSetup treat this the same as arriving from ProfileSetupPage
  // (isLinearFlow) — same onboarding-style shell, landing on the merged
  // "activities" screen (step 3 of 4), not a separate boxed page. Personal
  // fields go along unchanged (PUT re-sends the same values), only the
  // artifacts actually change.
  function handleEditArtifacts() {
    if (!profile) return;
    setProfileDraft({
      name: profile.name,
      age: String(profile.age),
      grade: String(profile.grade),
      city: profile.city,
      country: profile.country,
      language: profile.language,
      subjectsLike: profile.subjects_liked,
      subjectsDislike: profile.subjects_disliked,
      subjectsEasy: profile.subjects_easy,
      subjectsHard: profile.subjects_hard,
    });
    navigate('/onboarding/artifacts');
  }

  function handleEditCertificates() {
    navigate('/profile/certificates');
  }

  return {
    profile,
    displayName,
    initial,
    isJunior,
    hasSubjects,
    artifacts,
    certificates,
    gpaValue,
    gpaScale,
    railSections,
    strengthCards: report?.strength_cards ?? [],
    confirmRestart,
    handleLogout,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
    handleEditPersonal,
    handleEditSubjects,
    handleEditArtifacts,
    handleEditCertificates,
  };
}
