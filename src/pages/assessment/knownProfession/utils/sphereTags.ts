import type { AgeGroup, DirectionTreeNode } from '@/shared/types';

const MAX_TAGS = 3;

/** Example labels shown as tag pills on a sphere card — derived from the
 * sphere's own specialties since the tree endpoint has no sphere-level tags. */
export function getSphereTags(sphere: DirectionTreeNode, ageGroup: AgeGroup): string[] {
  const tags: string[] = [];
  for (const specialty of sphere.professions) {
    const label =
      ageGroup === 'junior' && specialty.label_junior ? specialty.label_junior : specialty.name;
    if (!tags.includes(label)) tags.push(label);
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

export function formatProfessionCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? 'профессия'
      : [2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)
        ? 'профессии'
        : 'профессий';
  return `${count} ${word}`;
}
