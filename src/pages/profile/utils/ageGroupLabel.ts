import type { AgeGroup } from '@/shared/types';

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  junior: 'Младший (6–10 лет)',
  middle: 'Средний (11–14 лет)',
  senior: 'Старший (15–18 лет)',
};

export function getAgeGroupLabel(ageGroup: AgeGroup | undefined): string | undefined {
  if (!ageGroup) return undefined;
  return AGE_GROUP_LABELS[ageGroup] ?? ageGroup;
}
