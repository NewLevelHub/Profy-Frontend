import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import { useAuthStore } from '@/shared/store/auth';
import type { ProfilePayload } from '@/shared/types';

type FieldErrors = Partial<Record<'name' | 'age' | 'grade', string>>;

const TOTAL_STEPS = 3;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

export function useProfileSetup() {
  const navigate = useNavigate();
  const userId = useAuthStore(s => s.user?.id);
  const setProfile = useProfileStore(s => s.setProfile);
  const storeProfile = useProfileStore(s => s.profile);

  // The Zustand profile store is in-memory only (no persist), so it's empty on
  // any fresh page load or direct navigation to this route (bookmark, refresh
  // mid-edit, new tab). Relying on it alone to decide create-vs-edit made the
  // form call POST /profile for users who already had one, which the backend
  // correctly rejects with 409 "Profile already exists for this user". Verify
  // against the backend instead, same as useWelcome/RequireProfile do.
  const { data: fetchedProfile, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () =>
      profileApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    enabled: Boolean(userId),
    retry: false,
  });

  const existing = fetchedProfile !== undefined ? fetchedProfile : storeProfile;
  const isEditMode = existing != null;

  const didInitFields = useRef(false);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(existing?.name ?? '');
  const [age, setAge] = useState(existing?.age ? String(existing.age) : '');
  const [grade, setGrade] = useState(existing?.grade ? String(existing.grade) : '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [country, setCountry] = useState(existing?.country ?? '');
  const [language, setLanguage] = useState(existing?.language ?? '');
  const [subjectsLike, setSubjectsLike] = useState<string[]>(existing?.subjects_like ?? []);
  const [subjectsDislike, setSubjectsDislike] = useState<string[]>(existing?.subjects_dislike ?? []);
  const [subjectsEasy, setSubjectsEasy] = useState<string[]>(existing?.subjects_easy ?? []);
  const [subjectsHard, setSubjectsHard] = useState<string[]>(existing?.subjects_hard ?? []);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Populate the form once the backend check resolves, in case the store was
  // empty at mount and fields were initialized blank. Runs only on the first
  // resolution so it doesn't clobber in-progress edits on a later refetch.
  useEffect(() => {
    if (didInitFields.current || fetchedProfile === undefined) return;
    didInitFields.current = true;
    if (!fetchedProfile) return;

    setProfile(fetchedProfile);
    setName(fetchedProfile.name ?? '');
    setAge(fetchedProfile.age ? String(fetchedProfile.age) : '');
    setGrade(fetchedProfile.grade ? String(fetchedProfile.grade) : '');
    setCity(fetchedProfile.city ?? '');
    setCountry(fetchedProfile.country ?? '');
    setLanguage(fetchedProfile.language ?? '');
    setSubjectsLike(fetchedProfile.subjects_like ?? []);
    setSubjectsDislike(fetchedProfile.subjects_dislike ?? []);
    setSubjectsEasy(fetchedProfile.subjects_easy ?? []);
    setSubjectsHard(fetchedProfile.subjects_hard ?? []);
  }, [fetchedProfile, setProfile]);

  const mutation = useMutation({
    mutationFn: (payload: ProfilePayload) =>
      isEditMode ? profileApi.update(payload) : profileApi.create(payload),
    onSuccess: (profile) => {
      setProfile(profile);
      navigate(isEditMode ? '/profile' : '/onboarding/artifacts', { replace: true });
    },
  });

  function clearError(field: keyof FieldErrors) {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validateStep1(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Введи своё имя';
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 6 || ageNum > 18) next.age = 'Возраст: от 6 до 18';
    const gradeNum = Number(grade);
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) next.grade = 'Класс: от 1 до 12';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => s - 1);
  }

  function handleSubmit() {
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
  }

  return {
    isCheckingProfile,
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
    subjectsDislike, setSubjectsDislike,
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
