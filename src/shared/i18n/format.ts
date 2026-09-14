import i18next from 'i18next';

import { DEFAULT_LOCALE } from '@/shared/store/locale';

/** BCP-47 tag for Intl, derived from the active i18next language. */
function intlLocale(): string {
  const lng = i18next.language || DEFAULT_LOCALE;
  return lng === 'kk' ? 'kk-KZ' : 'ru-RU';
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(), options).format(value);
}

export function formatDate(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(
    intlLocale(),
    options ?? { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(date);
}
