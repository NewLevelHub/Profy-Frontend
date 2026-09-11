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
 * store, and adopts the server-side preference (`user.locale`) once the user
 * logs in. Renders nothing.
 *
 * Note: the store may hold "kk" while `resolveLocale` still clamps to "ru"
 * (SUPPORTED_LOCALES gates it) — that's intentional, the choice is remembered
 * but dormant. Дремлет, впрочем, только интерфейс: см. ниже про отчёт.
 */
export function LocaleGate() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const user = useUser();
  const serverLocale = user?.locale;
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  // Одна попытка на сессию: если PATCH не прошёл, не долбим его на каждый рендер.
  const localeResetRef = useRef(false);
  // Tracks the locale we last applied, so the refetch below fires only on a
  // real switch — not on first mount.
  const appliedLocaleRef = useRef<string | null>(null);

  // Server preference wins after login.
  useEffect(() => {
    if (isLocale(serverLocale) && serverLocale !== locale) {
      setLocale(serverLocale);
    }
  }, [serverLocale, locale, setLocale]);

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
