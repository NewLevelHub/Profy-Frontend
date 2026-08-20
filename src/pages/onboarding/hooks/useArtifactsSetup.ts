import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { artifactsApi } from '@/shared/api/artifacts';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import { useOnboardingDraftStore } from '../onboardingDraftStore';
import type { ArtifactItem, ArtifactType } from '@/shared/types';

// 5 groups. During onboarding these render as steps 3-4 of the same linear
// flow ProfileSetupPage starts (see ArtifactsSetupPage): the first four
// groups merged onto one screen, 'dreams' alone on the last — not one
// screen per group anymore. Reopened later from Profile settings (edit
// mode), they still switch via tabs on one screen, one group at a time,
// since free jump-to-any-group is more useful there than a forced sequence.
// Order matches the section list either way.
export const ARTIFACT_SECTIONS = ['activities', 'achievements', 'professions', 'targets', 'dreams'] as const;
export type ArtifactSection = (typeof ARTIFACT_SECTIONS)[number];

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

function valuesOf(items: ArtifactItem[], type: ArtifactType): string[] {
  return items.filter(i => i.type === type).map(i => i.value);
}

export function useArtifactsSetup() {
  const navigate = useNavigate();
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);
  const profileDraft = useOnboardingDraftStore(s => s.profileDraft);
  const clearProfileDraft = useOnboardingDraftStore(s => s.clearProfileDraft);

  // Reliable without an extra fetch: /onboarding/* sits outside RequireProfile,
  // but the "Изменить" buttons that land here from /profile are always
  // launched from inside RequireProfile, so the store's `profile` is already
  // populated (artifacts included) for every edit case and null for fresh
  // onboarding. See useProfileSetup.ts for the matching logic.
  const hasExistingProfile = profile !== null;

  // This screen is also reachable from Profile settings to add/change
  // artifacts after onboarding is done — pre-fill from whatever's already
  // saved on the profile.
  const existing = profile?.artifacts;

  const [activeSection, setActiveSection] = useState<ArtifactSection>('activities');

  const [hobbies, setHobbies] = useState<string[]>(() => valuesOf(existing ?? [], 'hobby'));
  const [clubs, setClubs] = useState<string[]>(() => valuesOf(existing ?? [], 'club'));
  const [achievements, setAchievements] = useState<string[]>(() => valuesOf(existing ?? [], 'achievement'));
  const [professions, setProfessions] = useState<string[]>(() => valuesOf(existing ?? [], 'profession'));
  const [targets, setTargets] = useState<string[]>(() => valuesOf(existing ?? [], 'university'));
  const [dreams, setDreams] = useState(() => existing?.find(i => i.type === 'goal')?.value ?? '');

  // Coming here via ProfileSetupPage's handoff (profileDraft set) means the
  // forced-linear onboarding-style flow — whether that's a brand-new profile
  // (create) or an existing one being edited (update). No draft means the
  // artifacts-only shortcut from ArtifactsSection ("Изменить"/"Добавить"),
  // which keeps the tabbed free-jump editor regardless of hasExistingProfile.
  const isLinearFlow = profileDraft !== null;

  // Set synchronously the moment "Готово" is clicked (see submitAll below) —
  // a plain ref, not react-query/zustand state, so it can't lose a race
  // against either of those stores' own re-render timing. Its only job is
  // to permanently silence the "missing draft" redirect guard right below
  // once a submit is underway, including after success clears the draft.
  const hasSubmittedRef = useRef(false);

  // Linear flow (fresh onboarding OR personal-info edit, both parked their
  // fields in onboardingDraftStore via ProfileSetupPage): backend saves the
  // profile and these artifacts together in one call — POST for a brand-new
  // profile, PUT for an existing one — one transaction, nothing
  // half-created if artifacts turn out invalid.
  const saveProfileWithArtifactsMutation = useMutation({
    mutationFn: (items: ArtifactItem[]) => {
      if (!profileDraft) throw new Error('Missing profile draft');
      const payload = {
        name: profileDraft.name,
        age: Number(profileDraft.age),
        grade: Number(profileDraft.grade),
        city: profileDraft.city,
        country: profileDraft.country,
        language: profileDraft.language,
        subjects_liked: profileDraft.subjectsLike,
        subjects_disliked: profileDraft.subjectsDislike,
        subjects_easy: profileDraft.subjectsEasy,
        subjects_hard: profileDraft.subjectsHard,
        artifacts: items,
      };
      return hasExistingProfile ? profileApi.update(payload) : profileApi.create(payload);
    },
    onSuccess: (profile) => {
      setProfile(profile);
      clearProfileDraft();
      navigate(hasExistingProfile ? '/profile' : '/assessment/goal', { replace: true });
    },
  });

  // Reached directly (no profile drafted yet) by a user with no profile at
  // all either — there's nothing to submit here, so send back to profile
  // setup rather than letting "Готово" fail against a profile that doesn't
  // exist. A user with an existing profile but zero artifacts reaching this
  // page directly (e.g. "Добавить" on ArtifactsSection) is NOT redirected —
  // they get the tabbed editor and save via saveArtifactsMutation below.
  // Skipped once hasSubmittedRef is set: onSuccess above clears the draft
  // (profileDraft -> null) on its way to /assessment/goal or /profile, which
  // would otherwise re-trigger this exact effect and race that navigate —
  // sending a just-saved student back to step 1 even though the request
  // returned 200/201. A plain ref (not mutation.isSuccess) because zustand's
  // subscriber notification and react-query's own can land in different
  // render passes, and a reactive condition could still lose that race.
  useEffect(() => {
    if (!profileDraft && !hasExistingProfile && !hasSubmittedRef.current) {
      navigate('/onboarding/profile', { replace: true });
    }
  }, [profileDraft, hasExistingProfile, navigate]);

  // Artifacts-only shortcut (opened directly from ArtifactsSection, no
  // profile draft): unchanged — save artifacts alone via the original
  // endpoint, no profile fields involved.
  const saveArtifactsMutation = useMutation({
    mutationFn: (items: ArtifactItem[]) => artifactsApi.save(items),
    onSuccess: () => navigate('/profile', { replace: true }),
  });

  const isLoading = saveArtifactsMutation.isPending || saveProfileWithArtifactsMutation.isPending;
  const saveError = saveArtifactsMutation.isError || saveProfileWithArtifactsMutation.isError;

  function buildItems(): ArtifactItem[] {
    const items: ArtifactItem[] = [
      ...hobbies.map(v => ({ type: 'hobby' as const, value: v })),
      ...clubs.map(v => ({ type: 'club' as const, value: v })),
      ...achievements.map(v => ({ type: 'achievement' as const, value: v })),
      ...professions.map(v => ({ type: 'profession' as const, value: v })),
      ...targets.map(v => ({ type: 'university' as const, value: v })),
    ];
    const trimmedDreams = dreams.trim();
    if (trimmedDreams) items.push({ type: 'goal', value: trimmedDreams });
    return items;
  }

  function submitAll() {
    const items = buildItems();

    if (!isLinearFlow) {
      // Artifacts-only shortcut — nothing changed, skip the network call.
      if (items.length === 0) {
        navigate('/profile', { replace: true });
        return;
      }
      saveArtifactsMutation.mutate(items);
      return;
    }

    // Linear flow always saves the profile here (this is the only place it
    // gets saved), even with zero artifacts — unlike the artifacts-only
    // shortcut, there's no "nothing changed, skip the call" case.
    hasSubmittedRef.current = true;
    saveProfileWithArtifactsMutation.mutate(items);
  }

  const sectionIndex = ARTIFACT_SECTIONS.indexOf(activeSection);
  const isLastSection = sectionIndex === ARTIFACT_SECTIONS.length - 1;

  // "Дальше" and "Пропустить эту группу" both just move forward — nothing in
  // any group is required, so there's no real behavioral difference between
  // "I filled this in" and "I'm skipping it." Both are offered with equal
  // weight per spec so a student never feels obligated to fill a group in
  // to keep going.
  // Onboarding only ever shows two screens here (see ArtifactsSetupPage):
  // the first four sections merged onto one "group" screen (activeSection
  // stays at its initial 'activities' the whole time it's showing — just the
  // group's representative marker, not a currently-displayed single
  // section), then 'dreams' alone. Edit mode (opened from Profile settings)
  // still steps through all 5 tabs one at a time, unchanged.
  function advance() {
    if (isLastSection) {
      submitAll();
      return;
    }
    if (isLinearFlow) {
      setActiveSection('dreams');
      return;
    }
    setActiveSection(ARTIFACT_SECTIONS[sectionIndex + 1]);
  }

  // Only wired up during the linear step flow (the artifacts-only shortcut
  // uses free tab-jumping instead, no back button at all). Mirrors
  // ProfileSetupPage's own handleBack — and on the very first group, steps
  // back across the page boundary into profile setup's last step, since from
  // the student's point of view this is still one flow.
  function handleBack() {
    if (isLinearFlow) {
      if (activeSection === 'dreams') {
        setActiveSection('activities');
      } else {
        navigate('/onboarding/profile', { state: { resumeAtLastStep: true } });
      }
      return;
    }
    if (sectionIndex > 0) {
      setActiveSection(ARTIFACT_SECTIONS[sectionIndex - 1]);
    } else {
      navigate('/onboarding/profile', { state: { resumeAtLastStep: true } });
    }
  }

  return {
    activeSection, setActiveSection,
    sectionIndex,
    isLastSection,
    isLinearFlow,
    hobbies, setHobbies,
    clubs, setClubs,
    achievements, setAchievements,
    professions, setProfessions,
    targets, setTargets,
    dreams, setDreams,
    isLoading,
    saveError,
    handleNext: advance,
    handleSkip: advance,
    handleBack,
    toggle,
  };
}
