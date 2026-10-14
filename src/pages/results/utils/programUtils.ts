import type { TFunction } from 'i18next';

// These helpers render user-visible copy, so they take the caller's `t` (from
// `useTranslation`) rather than the `i18n` singleton — that keeps the calling
// component subscribed and re-rendering on `changeLanguage` (a bare
// `i18n.t()` here would freeze the string until some unrelated re-render).

/**
 * Splits a university's free-text admission notes into separate requirement
 * phrases for rendering as individual cards instead of one wall of text.
 * Source data (universities_92_professions.py `requirements_text`) is
 * curated prose that packs multiple distinct requirements into one string,
 * e.g. "Диплом; языковые сертификаты IELTS 6.0-6.5+ / TOEFL 80+. Для
 * пилотов и диспетчеров — строгие медицинские тесты EASA." — split on `;`
 * and on a sentence-ending `.` (period followed by whitespace + a capital
 * letter, and NOT preceded by a digit, so "6.5" isn't treated as a
 * sentence boundary).
 */
export function splitRequirementNotes(notes: string[]): string[] {
  return notes
    .flatMap(note => note.split(/(?<!\d)\.\s+(?=[А-ЯA-ZӘҒҚҢӨҰҮҺІ])|;\s*/))
    .map(part => part.trim().replace(/\.$/, ''))
    .filter(part => part.length > 0);
}

export function toDisplayString(value: unknown, t: TFunction): string {
  if (value === null || value === undefined) return t('common:emptyValue');
  if (typeof value === 'boolean') return value ? t('common:yes') : t('common:no');
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map((v) => toDisplayString(v, t)).join(', ');
  const obj = value as Record<string, unknown>;
  const preferred = ['amount', 'value', 'score', 'level', 'min', 'conditions', 'name'];
  for (const field of preferred) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const rest = obj.conditions !== undefined && field !== 'conditions'
        ? ` · ${String(obj.conditions)}`
        : '';
      return `${String(obj[field])}${rest}`;
    }
  }
  return Object.values(obj).filter(v => v !== null && v !== undefined).map(String).join(' · ') || t('common:emptyValue');
}
