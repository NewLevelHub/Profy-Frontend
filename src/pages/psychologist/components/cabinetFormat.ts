import type { TFunction } from 'i18next';
import { formatDate } from '@/shared/i18n/format';

/** A student without a filled profile is shown by email. */
export function studentName(name: string | null | undefined, email: string): string {
  return name?.trim() ? name : email;
}

/** "9 кл." — the grade is how school psychologists place a student. */
export function gradeShort(t: TFunction, grade: number | null | undefined): string {
  return grade ? t('psychologist:common.gradeShort', { grade }) : '—';
}


/** "21.09.2026, 14:35" */
export function dateTimeLabel(value: string): string {
  return formatDate(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "21.09" */
export function shortDateLabel(value: string): string {
  return formatDate(value, { day: '2-digit', month: '2-digit' });
}
