import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import type { ProfilePayload } from '@/shared/types';

type FieldErrors = Partial<Record<'name' | 'age' | 'grade', string>>;

const TOTAL_STEPS = 3;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

export function useProfileSetup() {
  const navigate = useNavigate();
  const setProfile = useProfileStore(s => s.setProfile);
  const existing = useProfileStore(s => s.profile);
  const isEditMode = existing !== null;

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
