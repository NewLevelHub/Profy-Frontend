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

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [subjectsLike, setSubjectsLike] = useState<string[]>([]);
  const [subjectsDislike, setSubjectsDislike] = useState<string[]>([]);
  const [subjectsEasy, setSubjectsEasy] = useState<string[]>([]);
  const [subjectsHard, setSubjectsHard] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const mutation = useMutation({
    mutationFn: (payload: ProfilePayload) => profileApi.create(payload),
    onSuccess: (profile) => {
      setProfile(profile);
      navigate('/onboarding/artifacts', { replace: true });
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
