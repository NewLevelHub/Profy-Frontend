import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import { useOnboardingDraftStore } from '../onboardingDraftStore';
import type { ProfilePayload } from '@/shared/types';

type FieldErrors = Partial<Record<'name' | 'age' | 'grade', string>>;

// 4 screens ("диалог, не форма"):
//  1. имя + возраст
//  2. класс + город (+ страна)
//  3. предметы, которые нравятся
//  4. предметы: легко / где приходится стараться больше (neutral framing —
//     see ProfileSetupPage's SUBJECTS_STRUGGLE copy)
const TOTAL_STEPS = 4;
const STEP_NAME_AGE = 1;
const STEP_SCHOOL_LANGUAGE = 2;
const STEP_SUBJECTS_LIKE = 3;
const STEP_SUBJECTS_STRUGGLE = 4;

export const PROFILE_STEPS = {
  NAME_AGE: STEP_NAME_AGE,
  SCHOOL_LANGUAGE: STEP_SCHOOL_LANGUAGE,
  SUBJECTS_LIKE: STEP_SUBJECTS_LIKE,
  SUBJECTS_STRUGGLE: STEP_SUBJECTS_STRUGGLE,
} as const;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

export function useProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const setProfile = useProfileStore(s => s.setProfile);
  const existing = useProfileStore(s => s.profile);
  // A real, already-onboarded profile exists server-side — this is a
  // Profile-settings edit (PUT), not fresh onboarding. Backend's combined
  // POST /profile (profile + artifacts in one call) only applies to
  // *creating* a profile, so edit mode keeps the old, untouched PUT flow.
  const isEditMode = existing !== null;

  const draft = useOnboardingDraftStore(s => s.profileDraft);
  const setProfileDraft = useOnboardingDraftStore(s => s.setProfileDraft);

  const locationState = location.state as { resumeAtLastStep?: boolean; fromSettings?: boolean } | null;
  // Arriving back here via "Назад" from artifacts' first group (see
  // useArtifactsSetup.handleBack) resumes at the last step instead of
  // restarting the whole form — from the student's point of view they never
  // left this flow, just stepped back one screen.
  const resumeAtLastStep = Boolean(locationState?.resumeAtLastStep);
  const cameFromSettings = Boolean(locationState?.fromSettings);
  const [step, setStep] = useState(resumeAtLastStep ? TOTAL_STEPS : 1);
  // Field values come from (in priority order): an already-onboarded server
  // profile (settings edit), a draft parked here on a previous pass through
  // this screen during onboarding (resumed via "Назад" from artifacts), or
  // blank for a brand-new pass.
  const [name, setName] = useState(existing?.name ?? draft?.name ?? '');
  const [age, setAge] = useState(existing?.age ? String(existing.age) : draft?.age ?? '');
  const [grade, setGrade] = useState(existing?.grade ? String(existing.grade) : draft?.grade ?? '');
  const [city, setCity] = useState(existing?.city ?? draft?.city ?? '');
  const [country, setCountry] = useState(existing?.country ?? draft?.country ?? '');
  // No onboarding screen collects this right now (removed as not-needed-yet) —
  // kept in state purely so an edit-mode profile that already has a language
  // set doesn't lose it on save, and so the required ProfilePayload field
  // still gets submitted (empty string for new profiles).
  const [language, setLanguage] = useState(existing?.language ?? draft?.language ?? '');
  const [subjectsLike, setSubjectsLike] = useState<string[]>(existing?.subjects_like ?? draft?.subjectsLike ?? []);
  const [subjectsEasy, setSubjectsEasy] = useState<string[]>(existing?.subjects_easy ?? draft?.subjectsEasy ?? []);
  // "Где приходится стараться больше" — a difficulty question (paired with
  // subjectsEasy), so it maps to subjects_hard, not subjects_dislike (which
  // is a *preference* field — "не нравится" — that this flow has no screen
  // for at all). Passed through unedited from an existing profile rather
  // than silently dropped from the payload contract.
  const [subjectsHard, setSubjectsHard] = useState<string[]>(existing?.subjects_hard ?? draft?.subjectsHard ?? []);
  const [subjectsDislike] = useState<string[]>(existing?.subjects_dislike ?? []);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Only used in edit mode — fresh onboarding never calls the API from this
  // screen anymore (see handleSubmit below).
  const mutation = useMutation({
    mutationFn: (payload: ProfilePayload) => profileApi.update(payload),
    onSuccess: (profile) => {
      setProfile(profile);
      navigate(cameFromSettings ? '/profile' : '/onboarding/artifacts', { replace: true });
    },
  });

  function clearError(field: keyof FieldErrors) {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validateNameAge(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Введи своё имя';
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 6 || ageNum > 18) next.age = 'Возраст: от 6 до 18';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateSchool(): boolean {
    const next: FieldErrors = {};
    const gradeNum = Number(grade);
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) next.grade = 'Класс: от 1 до 12';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (step === STEP_NAME_AGE && !validateNameAge()) return;
    if (step === STEP_SCHOOL_LANGUAGE && !validateSchool()) return;
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => s - 1);
  }

  function handleSubmit() {
    if (isEditMode) {
      // Settings edit — unchanged PUT flow, no artifacts involved here.
      mutation.mutate({
        name: name.trim(),
        age: Number(age),
        grade: Number(grade),
        city: city.trim(),
        country: country.trim(),
        language,
        subjects_like: subjectsLike,
        subjects_dislike: subjectsDislike,
        subjects_easy: subjectsEasy,
        subjects_hard: subjectsHard,
      });
      return;
    }

    // Fresh onboarding — the actual POST /profile happens once, at the end
    // of the whole sequence (steps 5-9, in ArtifactsSetupPage), combining
    // this data with whatever artifacts get collected there. Just park the
    // fields and move on; no network call from this screen anymore.
    setProfileDraft({
      name: name.trim(),
      age,
      grade,
      city: city.trim(),
      country: country.trim(),
      language,
      subjectsLike,
      subjectsEasy,
      subjectsHard,
    });
    navigate('/onboarding/artifacts', { replace: true });
  }

  return {
    step,
    totalSteps: TOTAL_STEPS,
    progress: (step / TOTAL_STEPS) * 100,
    name, setName,
    age, setAge,
    grade, setGrade,
    city, setCity,
    country, setCountry,
    language, setLanguage,
    subjectsLike, setSubjectsLike,
    subjectsEasy, setSubjectsEasy,
    subjectsHard, setSubjectsHard,
    errors,
    clearError,
    isLoading: mutation.isPending,
    submitError: mutation.isError ? 'Не удалось сохранить. Попробуй ещё раз.' : null,
    handleNext,
    handleBack,
    handleSubmit,
    toggle,
  };
}
