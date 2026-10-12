import { useEffect, useRef } from 'react';

import { useUser } from '@/shared/hooks/useAuth';
import { isLocale, resolveLocale, useLocaleStore, type Locale } from '@/shared/store/locale';

/**
 * The language the server will actually answer in — not the one the UI
 * already shows.
 *
 * For a signed-in user the backend resolves content from `users.locale` and
 * ignores Accept-Language (app/dependencies.py). LanguageSwitcher flips the
 * UI at once but updates `user.locale` only after its PATCH lands, so a
 * refetch keyed on the store locale races that PATCH and can bring the old
 * language back. Keyed on this value, it runs once the account has switched.
 * Guests have no account preference — the header is all there is.
 */
function useContentLocale(): Locale {
  const storeLocale = useLocaleStore((s) => s.locale);
  const serverLocale = useUser()?.locale;
  return resolveLocale(isLocale(serverLocale) ? serverLocale : storeLocale);
}

/**
 * Calls `onChange` when the content locale switches — never on mount. For
 * screens that keep server text in local state instead of React Query (the
 * test battery), which LocaleGate's cache invalidation doesn't reach.
 */
export function useOnContentLocaleChange(onChange: (locale: Locale) => void) {
  const locale = useContentLocale();
  const previousRef = useRef(locale);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (previousRef.current === locale) return;
    previousRef.current = locale;
    onChangeRef.current(locale);
  }, [locale]);
}
