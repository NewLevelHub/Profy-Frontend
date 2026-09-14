import type { AgeGroup } from '@/shared/types';

// i18n keys — the caller resolves the returned value via `t()`
// (profile/ageGroup.*).
const AGE_GROUP_LABEL_KEYS: Record<AgeGroup, string> = {
  junior: 'profile:ageGroup.junior',
  middle: 'profile:ageGroup.middle',
  senior: 'profile:ageGroup.senior',
};

/** Returns the i18n key for the age-group label; resolve with `t()`. */
export function getAgeGroupLabel(ageGroup: AgeGroup | undefined): string | undefined {
  if (!ageGroup) return undefined;
  return AGE_GROUP_LABEL_KEYS[ageGroup] ?? ageGroup;
}
