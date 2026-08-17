/**
 * Small Russian date/pluralization helpers for the /home overview.
 * No date library in this project (checked package.json) — Intl covers the
 * one format we need (`ru-RU`, day + genitive month, e.g. "6 августа").
 */

/** Standard Russian plural-form selector: [one, few, many] — e.g. ['день', 'дня', 'дней']. */
export function pluralizeRu(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

/** "6 августа" — day + genitive month, no year (matches the spec example verbatim). */
export function formatDiagnosisDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

/** "ОБНОВЛЕНО 4 ДНЯ НАЗАД" (uppercase, matches the mono meta-label convention). */
export function formatUpdatedAgo(iso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return 'ОБНОВЛЕНО СЕГОДНЯ';
  if (days === 1) return 'ОБНОВЛЕНО ВЧЕРА';
  const word = pluralizeRu(days, ['ДЕНЬ', 'ДНЯ', 'ДНЕЙ']);
  return `ОБНОВЛЕНО ${days} ${word} НАЗАД`;
}
