import type { MascotKind } from '@/shared/ui/Mascot';

/** Best-effort mapping from a career-direction sphere slug to the closest
 * matching mascot illustration — the 15 mascot kinds are a fixed design-system
 * set that doesn't line up 1:1 with the akinator sphere taxonomy, so a few
 * spheres fall back to the nearest thematic mascot rather than an exact match. */
export const SPHERE_MASCOT: Record<string, MascotKind> = {
  'akinator-medicine': 'med',
  'akinator-psychology-help': 'psy',
  'akinator-animals-nature': 'eco',
  'akinator-it-data': 'it',
  'akinator-engineering-tech': 'eng',
  'akinator-construction-manual': 'eng',
  'akinator-creative-design': 'design',
  'akinator-stage-media': 'media',
  'akinator-words-communication': 'media',
  'akinator-education': 'psy',
  'akinator-sports-body': 'eco',
  'akinator-food-hospitality': 'marketing',
  'akinator-business-sales': 'business',
  'akinator-beauty-services': 'design',
  'akinator-safety-rescue': 'law',
  'akinator-logistics-service': 'business',
};
