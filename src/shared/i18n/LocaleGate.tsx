import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import i18next from 'i18next';

import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import { useUser } from '@/shared/hooks/useAuth';
import { useAuthStore } from '@/shared/store/auth';
import {
  DEFAULT_LOCALE,
  LOCALE_SWITCH_ENABLED,
  isLocale,
  resolveLocale,
  useLocaleStore,
} from '@/shared/store/locale';

/**
 * Keeps i18next's active language and <html lang> in sync with the locale
 * store, and reconciles it with the server-side preference (`user.locale`)
 * once the user logs in. Renders nothing.
 *
 * If SUPPORTED_LOCALES is ever collapsed back to one locale, `resolveLocale`
 * clamps the interface to it while the store keeps the real preference — see
 * the reset effect below for why that alone isn't enough for the account.
 */
export function LocaleGate() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const user = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const serverLocale = user?.locale;
  const queryClient = useQueryClient();
  // Одна попытка на сессию: если PATCH не прошёл, не долбим его на каждый рендер.
  const localeResetRef = useRef(false);
  // Which user.id this reconciliation has already run for. Without this gate
  // the effect below re-fires on every `locale` change — including the one
  // caused by the user's own click — and races its stale `serverLocale`
  // against the in-flight PATCH from that very click, snapping the switch
  // straight back (see the incident: switching away from a saved non-default
  // locale back to the default got stuck, because the effect kept treating
  // the pre-click serverLocale as authoritative). Reconciling once per login
  // is enough — after that, LanguageSwitcher's own PATCH is the only writer.
  const reconciledUserIdRef = useRef<string | null>(null);
  // Tracks the locale we last applied, so the refetch below fires only on a
  // real switch — not on first mount.
  const appliedLocaleRef = useRef<string | null>(null);

  // Reconcile the locale picked *before* login (e.g. as a guest) with the
  // account's saved preference. Registration/login never send the session's
  // locale up, so a fresh or never-switched account always reports the
  // backend default ("ru") — treat that as "no real preference yet" rather
  // than blindly overwriting a locale the user just chose. A non-default
  // server value, on the other hand, is only ever set by an explicit switch
  // (here or on another device), so it wins — but only at this one login-time
  // reconciliation, not on every later render.
  useEffect(() => {
    if (!user) {
      reconciledUserIdRef.current = null;
      return;
    }
    if (reconciledUserIdRef.current === user.id || !isLocale(serverLocale)) return;
    reconciledUserIdRef.current = user.id;

    if (serverLocale === locale) return;

    if (serverLocale !== DEFAULT_LOCALE) {
      setLocale(serverLocale);
      return;
    }

    if (locale !== DEFAULT_LOCALE) {
      void apiClient
        .patch(API.auth.me, { locale })
        .then(() => setUser({ ...user, locale }))
        .catch(() => {
          // Best effort — the local choice still applies for this session,
          // it just didn't stick to the account this time.
        });
    }
  }, [serverLocale, locale, user, setLocale, setUser]);

  // Пока выбор языка выключен (SUPPORTED_LOCALES свёрнут к одному), аккаунт,
  // застрявший на другом языке, надо вернуть на язык по умолчанию — и именно
  // на сервере.
  //
  // Гасить переключатель на фронте недостаточно: отчёт рендерится по
  // `users.locale` его владельца, а не по Accept-Language запроса (это
  // сознательное решение бэкенда — админ на ru должен видеть отчёт kk-ученика
  // на kk, см. report_service._resolve_owner_locale). Поэтому у аккаунта с
  // users.locale='kk' интерфейс встанет русским, а текст отчёта продолжит
  // генерироваться казахским — экран поедет на двух языках.
  //
  // Цена: у того, кто успел выбрать kk, выбор стирается и после возврата
  // переключателя его придётся сделать заново. Осознанно: kk сейчас и прячут
  // потому, что перевод неполон (PRO-254).
  useEffect(() => {
    if (LOCALE_SWITCH_ENABLED || localeResetRef.current) return;
    if (!user || !isLocale(serverLocale) || serverLocale === DEFAULT_LOCALE) return;

    localeResetRef.current = true;
    void (async () => {
      try {
        await apiClient.patch(API.auth.me, { locale: DEFAULT_LOCALE });
        setUser({ ...user, locale: DEFAULT_LOCALE });
        setLocale(DEFAULT_LOCALE);
      } catch {
        // Бэкенд может не принимать `locale` — не повод ломать сессию.
        // Интерфейс всё равно уже зажат resolveLocale в язык по умолчанию.
      }
    })();
  }, [user, serverLocale, setUser, setLocale]);

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
