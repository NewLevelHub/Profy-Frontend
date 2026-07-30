import type { MascotKind } from '@/shared/ui/Mascot';
import { SPHERE_MASCOT } from './sphereMascot';

/** Leaf specialty slug → parent sphere slug — mirrors the 57-specialty
 * catalog seeded by profi-backend/scripts/seed_akinator_content.py. Needed
 * because AkinatorResultResponse only carries the leaf `direction_slug`, not
 * its sphere, so the result hero can't otherwise pick a matching mascot. */
const LEAF_SPHERE: Record<string, string> = {
  'general-medicine': 'akinator-medicine',
  dentist: 'akinator-medicine',
  pharmacist: 'akinator-medicine',
  'medicine-biology': 'akinator-medicine',
  psychologist: 'akinator-psychology-help',
  'speech-therapist': 'akinator-psychology-help',
  'social-worker': 'akinator-psychology-help',
  'psychology-pedagogy': 'akinator-psychology-help',
  'veterinary-zootechnics': 'akinator-animals-nature',
  agronomist: 'akinator-animals-nature',
  zoologist: 'akinator-animals-nature',
  ecologist: 'akinator-animals-nature',
  'science-research': 'akinator-animals-nature',
  'ecology-nature': 'akinator-animals-nature',
  'software-engineer': 'akinator-it-data',
  'data-science': 'akinator-it-data',
  'it-infrastructure-security': 'akinator-it-data',
  'it-development': 'akinator-it-data',
  'artificial-intelligence': 'akinator-it-data',
  'mechanical-engineer': 'akinator-engineering-tech',
  'civil-engineering': 'akinator-engineering-tech',
  pilot: 'akinator-engineering-tech',
  'engineering-architecture': 'akinator-engineering-tech',
  'petroleum-mining-geology': 'akinator-engineering-tech',
  'energy-engineering': 'akinator-engineering-tech',
  'aviation-engineering': 'akinator-engineering-tech',
  design: 'akinator-creative-design',
  architect: 'akinator-creative-design',
  'design-digital-art': 'akinator-creative-design',
  actor: 'akinator-stage-media',
  musician: 'akinator-stage-media',
  'film-director': 'akinator-stage-media',
  cinematographer: 'akinator-stage-media',
  'makeup-artist-film': 'akinator-stage-media',
  'media-journalism': 'akinator-stage-media',
  journalist: 'akinator-words-communication',
  translator: 'akinator-words-communication',
  lawyer: 'akinator-words-communication',
  'pr-specialist': 'akinator-words-communication',
  'law-public-administration': 'akinator-words-communication',
  'international-relations': 'akinator-words-communication',
  'school-teacher': 'akinator-education',
  'kindergarten-teacher': 'akinator-education',
  'sports-coach': 'akinator-sports-body',
  'rehabilitation-therapist': 'akinator-sports-body',
  'food-production-tech': 'akinator-food-hospitality',
  'hospitality-manager': 'akinator-food-hospitality',
  'management-entrepreneurship': 'akinator-business-sales',
  marketing: 'akinator-business-sales',
  'finance-accounting': 'akinator-business-sales',
  'marketing-advertising': 'akinator-business-sales',
  'business-entrepreneurship': 'akinator-business-sales',
  'finance-economics': 'akinator-business-sales',
  'project-management': 'akinator-business-sales',
  logistics: 'akinator-business-sales',
  'fire-safety-engineer': 'akinator-safety-rescue',
  'police-officer': 'akinator-safety-rescue',
};

/** Best-effort: unknown/retired slugs (e.g. an old result from before the
 * 2026 specialty pivot) fall back to a neutral generalist mascot. */
export function getDirectionMascot(directionSlug: string): MascotKind {
  const sphere = LEAF_SPHERE[directionSlug];
  return (sphere && SPHERE_MASCOT[sphere]) || 'business';
}
