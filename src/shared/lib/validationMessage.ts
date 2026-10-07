import type { TFunction } from 'i18next';
import type { ValidationMessage } from '@/shared/types';

/** Field errors kept as ValidationMessage → text in the current language.
 *  Call it on every render (hooks return the result), so switching the
 *  language re-translates errors that are already on screen. */
export function translateErrors<K extends string>(
  errors: Partial<Record<K, ValidationMessage>>,
  t: TFunction,
): Partial<Record<K, string>> {
  const entries = Object.entries(errors) as [K, ValidationMessage | undefined][];
  return Object.fromEntries(
    entries.map(([field, message]) => [field, message && t(message.key, message.params)]),
  ) as Partial<Record<K, string>>;
}
