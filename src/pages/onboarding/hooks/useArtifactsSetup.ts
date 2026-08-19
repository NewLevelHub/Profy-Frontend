import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
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
  const setProfile = useProfileStore(s => s.setProfile);
  const profileDraft = useOnboardingDraftStore(s => s.profileDraft);
  const clearProfileDraft = useOnboardingDraftStore(s => s.clearProfileDraft);

  const [activeSection, setActiveSection] = useState<ArtifactSection>('activities');

  const [hobbies, setHobbies] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [dreams, setDreams] = useState('');

  // This screen is also reachable from Profile settings to add/change
  // artifacts after onboarding is done — pre-fill from whatever's already
  // saved, and remember whether anything existed so "Готово" knows whether
  // to continue into the assessment flow (first time) or return to the
  // profile (editing later).
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: existing, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () =>
      artifactsApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return [];
        throw err;
      }),
    retry: false,
  });

  useEffect(() => {
    if (!existing) return;
    if (existing.length > 0) {
      setIsEditMode(true);
      setHobbies(valuesOf(existing, 'hobby'));
      setClubs(valuesOf(existing, 'club'));
      setAchievements(valuesOf(existing, 'achievement'));
      setProfessions(valuesOf(existing, 'profession'));
      setTargets(valuesOf(existing, 'university'));
      setDreams(existing.find(i => i.type === 'goal')?.value ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  // Set synchronously the moment "Готово" is clicked (see submitAll below) —
  // a plain ref, not react-query/zustand state, so it can't lose a race
  // against either of those stores' own re-render timing. Its only job is
  // to permanently silence the "missing draft" redirect guard right below
  // once a submit is underway, including after success clears the draft.
  const hasSubmittedRef = useRef(false);

  // Onboarding (no existing artifacts): backend now saves the profile
  // (parked in onboardingDraftStore by ProfileSetupPage) and these artifacts
  // together in one POST /profile call — one transaction, nothing
  // half-created if artifacts turn out invalid.
  const createProfileWithArtifactsMutation = useMutation({
    mutationFn: (items: ArtifactItem[]) => {
      if (!profileDraft) throw new Error('Missing profile draft');
      return profileApi.create({
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
      });
    },
    onSuccess: (profile) => {
      setProfile(profile);
      clearProfileDraft();
      navigate('/assessment/goal', { replace: true });
    },
  });

  // Reached directly (no profile drafted yet) without any existing artifacts
  // either — there's nothing to submit here, so send back to profile setup
  // rather than letting "Готово" fail against a profile that doesn't exist.
  // Skipped once hasSubmittedRef is set: onSuccess above clears the draft
  // (profileDraft -> null) on its way to /assessment/goal, which would
  // otherwise re-trigger this exact effect and race that navigate — sending
  // a just-onboarded student back to step 1 even though the POST returned
  // 200/201. A plain ref (not mutation.isSuccess) because zustand's
  // subscriber notification and react-query's own can land in different
  // render passes, and a reactive condition could still lose that race.
  useEffect(() => {
    if (!isLoadingExisting && !isEditMode && !profileDraft && !hasSubmittedRef.current) {
      navigate('/onboarding/profile', { replace: true });
    }
  }, [isLoadingExisting, isEditMode, profileDraft, navigate]);

  // Edit mode (existing artifacts, opened from Profile settings): unchanged
  // — save artifacts alone via the original endpoint.
  const saveArtifactsMutation = useMutation({
    mutationFn: (items: ArtifactItem[]) => artifactsApi.save(items),
    onSuccess: () => navigate('/profile', { replace: true }),
  });

  const isLoading = saveArtifactsMutation.isPending || createProfileWithArtifactsMutation.isPending;
  const saveError = saveArtifactsMutation.isError || createProfileWithArtifactsMutation.isError;

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

    if (isEditMode) {
      // Nothing changed — skip the network call, same as before.
      if (items.length === 0) {
        navigate('/profile', { replace: true });
        return;
      }
      saveArtifactsMutation.mutate(items);
      return;
    }

    // Onboarding always creates the profile here (this is the only place it
    // gets saved), even with zero artifacts — unlike edit mode, there's no
    // "nothing changed, skip the call" case.
    hasSubmittedRef.current = true;
    createProfileWithArtifactsMutation.mutate(items);
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
    if (!isEditMode) {
      setActiveSection('dreams');
      return;
    }
    setActiveSection(ARTIFACT_SECTIONS[sectionIndex + 1]);
  }

  // Only wired up during onboarding's linear step flow (edit mode uses free
  // tab-jumping instead, no back button at all). Mirrors ProfileSetupPage's
  // own handleBack — and on the very first group, steps back across the
  // page boundary into profile setup's last step, since from the student's
  // point of view this is still one flow.
  function handleBack() {
    if (!isEditMode) {
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
    isEditMode,
    isLoadingExisting,
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
