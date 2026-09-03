import type { CertificateType } from '@/shared/types';

// Shared by the two places that collect exam scores — onboarding step 2's
// optional exam block (pick the exams you sat, then enter each score) and
// Profile's dedicated "Баллы за экзамены" editor (four always-visible rows,
// since by then the student came here specifically to fill them in).
export const CERTIFICATE_TYPES: CertificateType[] = ['ielts', 'unt', 'sat', 'toefl'];

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  ielts: 'IELTS',
  unt: 'ЕНТ',
  sat: 'SAT',
  toefl: 'TOEFL',
};

// Mirrors the backend's SCORE_RANGES (app/schemas/certificate.py) so a
// value the UI accepts never bounces back as a 422.
export const CERTIFICATE_SCORE_RANGES: Record<CertificateType, { min: number; max: number; step: number }> = {
  ielts: { min: 0, max: 9, step: 0.5 },
  unt: { min: 0, max: 140, step: 1 },
  sat: { min: 400, max: 1600, step: 10 },
  toefl: { min: 0, max: 120, step: 1 },
};

// ── Validation ───────────────────────────────────────────────────────────────
// Both collection points (onboarding step 2, Profile's exam-scores editor)
// run the same check against the ranges above, so the rule lives here rather
// than being written twice with two different error strings.

/** `undefined` when `raw` is a valid score for `type`, else the error to show.
 *  An empty string is only valid when the exam wasn't claimed at all — callers
 *  that let a student tick "I sat this one" pass `required: true`. */
export function validateCertificateScore(
  type: CertificateType,
  raw: string,
  { required = false }: { required?: boolean } = {},
): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return required ? 'Укажи балл' : undefined;
  const value = Number(trimmed);
  const { min, max } = CERTIFICATE_SCORE_RANGES[type];
  return Number.isNaN(value) || value < min || value > max ? `От ${min} до ${max}` : undefined;
}
