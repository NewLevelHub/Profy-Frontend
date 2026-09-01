import type { BadgeVariant } from '@/shared/ui/Badge';
import type { PlanTrack } from '@/shared/types';

/** Neutral label + Badge variant per track. No gamified wording. */
export const TRACK_META: Record<PlanTrack, { label: string; badge: BadgeVariant }> = {
  ent: { label: 'ЕНТ и предметы', badge: 'success' },
  profession: { label: 'Навык профессии', badge: 'brand' },
  growth: { label: 'Зона роста', badge: 'accent' },
  admission: { label: 'Поступление', badge: 'warning' },
  language: { label: 'Язык', badge: 'default' },
};
