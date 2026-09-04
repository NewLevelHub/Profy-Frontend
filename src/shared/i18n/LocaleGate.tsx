import { useEffect } from 'react';
import i18next from 'i18next';

import { useUser } from '@/shared/hooks/useAuth';
import { isLocale, resolveLocale, useLocaleStore } from '@/shared/store/locale';

/**
 * Keeps i18next's active language and <html lang> in sync with the locale
 * store, and adopts the server-side preference (`user.locale`) once the user
 * logs in. Renders nothing.
 *
 * Note: the store may hold "kk" while `resolveLocale` still clamps to "ru"
 * (SUPPORTED_LOCALES gates it until KZ-603) — that's intentional, the choice
 * is remembered but dormant.
 */
export function LocaleGate() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const serverLocale = useUser()?.locale;

  // Server preference wins after login.
  useEffect(() => {
    if (isLocale(serverLocale) && serverLocale !== locale) {
      setLocale(serverLocale);
    }
  }, [serverLocale, locale, setLocale]);

  // Apply the (clamped) locale to i18next and the document.
  useEffect(() => {
    const active = resolveLocale(locale);
    if (i18next.language !== active) {
      void i18next.changeLanguage(active);
    }
    document.documentElement.lang = active;
  }, [locale]);

  return null;
}
