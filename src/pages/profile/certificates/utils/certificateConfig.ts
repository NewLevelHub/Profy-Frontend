import type { CertificateType, GpaScale } from '@/shared/types';

// Fixed, small set — unlike artifacts (freeform chips), these render as
// four dedicated rows rather than a "pick a type, then add" flow.
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

export const GPA_SCALES: GpaScale[] = ['4', '5', '10', '100'];

export const GPA_SCALE_LABELS: Record<GpaScale, string> = {
  '4': '4.0',
  '5': '5.0',
  '10': '10.0',
  '100': '100',
};

// Mirrors the backend's GPA_SCALE_MAX (app/models/profile.py).
export const GPA_SCALE_MAX: Record<GpaScale, number> = {
  '4': 4,
  '5': 5,
  '10': 10,
  '100': 100,
};

export const GPA_SCALE_STEP: Record<GpaScale, number> = {
  '4': 0.01,
  '5': 0.01,
  '10': 0.01,
  '100': 0.1,
};
