import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { artifactsApi } from '@/shared/api/artifacts';
import type { ArtifactItem } from '@/shared/types';

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(s => s !== item) : [...list, item];
}

export function useArtifactsSetup() {
  const navigate = useNavigate();

  const [hobbies, setHobbies] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [dreams, setDreams] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  const [achievementInput, setAchievementInput] = useState('');
  const [dreamInput, setDreamInput] = useState('');
  const [professionInput, setProfessionInput] = useState('');
  const [targetInput, setTargetInput] = useState('');

  const mutation = useMutation({
    mutationFn: (items: ArtifactItem[]) => artifactsApi.save(items),
    onSuccess: () => navigate('/assessment/goal', { replace: true }),
  });

  function buildItems(): ArtifactItem[] {
    return [
      ...hobbies.map(v => ({ type: 'hobby' as const, value: v })),
      ...clubs.map(v => ({ type: 'club' as const, value: v })),
      ...achievements.map(v => ({ type: 'achievement' as const, value: v })),
      ...dreams.map(v => ({ type: 'goal' as const, value: v })),
      ...professions.map(v => ({ type: 'profession' as const, value: v })),
      ...targets.map(v => ({ type: 'university' as const, value: v })),
    ];
  }

  function handleNext() {
    const items = buildItems();
    if (items.length === 0) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    mutation.mutate(items);
  }

  function handleSkip() {
    navigate('/assessment/goal', { replace: true });
  }

  function addTag(
    input: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    const trimmed = input.trim();
    if (!trimmed) return;
    setList(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setInput('');
  }

  return {
    hobbies, setHobbies,
    clubs, setClubs,
    achievements, setAchievements,
    dreams, setDreams,
    professions, setProfessions,
    targets, setTargets,
    achievementInput, setAchievementInput,
    dreamInput, setDreamInput,
    professionInput, setProfessionInput,
    targetInput, setTargetInput,
    isLoading: mutation.isPending,
    saveError: mutation.isError,
    handleNext,
    handleSkip,
    addTag,
    toggle,
  };
}
