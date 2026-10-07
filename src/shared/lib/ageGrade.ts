/**
 * Age ↔ school-grade pairing (PRO-420).
 * Mirrors `app/services/age_grade.py` on the backend — keep the constants
 * and delta rule in sync.
 */

export const MIN_AGE_MINUS_GRADE = 5;
export const MAX_AGE_MINUS_GRADE = 8;
export const GRADE_MIN = 1;
export const GRADE_MAX = 12;

export function isAgeGradeCompatible(age: number, grade: number): boolean {
  if (!Number.isInteger(grade) || grade < GRADE_MIN || grade > GRADE_MAX) return false;
  if (!Number.isInteger(age)) return false;
  const delta = age - grade;
  return delta >= MIN_AGE_MINUS_GRADE && delta <= MAX_AGE_MINUS_GRADE;
}

export function gradesForAge(age: number): number[] {
  if (!Number.isInteger(age)) return [];
  const out: number[] = [];
  for (let g = GRADE_MIN; g <= GRADE_MAX; g += 1) {
    if (isAgeGradeCompatible(age, g)) out.push(g);
  }
  return out;
}
