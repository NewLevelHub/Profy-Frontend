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

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days between `value` and now (0 — today). */
export function daysAgo(value: string, now: Date = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(value))) / DAY_MS);
}

/** "сегодня 14:35", "вчера 18:02", "4 дня назад". */
export function agoLabel(t: TFunction, value: string): string {
  const days = daysAgo(value);
  const time = formatDate(value, { hour: '2-digit', minute: '2-digit' });
  if (days <= 0) return t('psychologist:common.todayAt', { time });
  if (days === 1) return t('psychologist:common.yesterdayAt', { time });
  return t('psychologist:common.daysAgo', { count: days });
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
