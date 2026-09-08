import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  // Tracks the locale we last applied, so the refetch below fires only on a
  // real switch — not on first mount.
  const appliedLocaleRef = useRef<string | null>(null);

  // Server preference wins after login.
  useEffect(() => {
    if (isLocale(serverLocale) && serverLocale !== locale) {
      setLocale(serverLocale);
    }
  }, [serverLocale, locale, setLocale]);

  // Apply the (clamped) locale to i18next and the document, and drop cached
  // server responses so DB-backed static content re-translates at once.
  useEffect(() => {
    const active = resolveLocale(locale);
    if (i18next.language !== active) {
      void i18next.changeLanguage(active);
    }
    document.documentElement.lang = active;

    // University / program names and descriptions, the direction catalog,
    // gap-analysis labels and every other non-LLM field are resolved
    // server-side from the request's Accept-Language (api/client.ts). React
    // Query has the previous locale's responses cached, so without this the
    // translated copy only shows up after a full reload. Invalidating on a
    // real switch refetches every server query with the new header while the
    // current text stays on screen until each response swaps in. Individual
    // hooks still keep `locale` in their queryKey so toggling back is a cache
    // hit rather than another round-trip.
    const previous = appliedLocaleRef.current;
    appliedLocaleRef.current = active;
    if (previous !== null && previous !== active) {
      document.documentElement.classList.add('locale-crossfade');
      window.setTimeout(() => {
        document.documentElement.classList.remove('locale-crossfade');
      }, 280);
      void queryClient.invalidateQueries();
    }
  }, [locale, queryClient]);

  return null;
}
