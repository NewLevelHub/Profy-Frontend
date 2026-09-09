import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Locales the app can hold a preference for. "kk" is accepted and persisted
 * before it is user-reachable — see SUPPORTED_LOCALES / KZ-603. Keep in sync
 * with the backend `locale_enum`.
 */
export type Locale = 'ru' | 'kk';

export const KNOWN_LOCALES: readonly Locale[] = ['ru', 'kk'];

/**
 * Locales actually offered to the user right now. KZ-603 (2026-09-08) added
 * 'kk' — no feature flag. `revert` that change to go back to ['ru'] and the
 * LanguageSwitcher hides itself again.
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['ru', 'kk'];

export const DEFAULT_LOCALE: Locale = 'ru';

/**
 * Whether the user is offered a language choice at all. `true` since KZ-603
 * added 'kk' to SUPPORTED_LOCALES — drives whether the LanguageSwitcher and
 * its host rows render.
 */
export const LOCALE_SWITCH_ENABLED = SUPPORTED_LOCALES.length > 1;

/** LocalStorage key — also read directly (no store import) by api/client.ts. */
export const LOCALE_STORAGE_KEY = 'profy-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (KNOWN_LOCALES as readonly string[]).includes(value);
}

/** Clamp any input to a runtime-usable locale. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) && (SUPPORTED_LOCALES as readonly string[]).includes(value)
    ? value
    : DEFAULT_LOCALE;
}

/**
 * Best-effort read of the persisted locale without importing zustand — used by
 * the axios request interceptor, which must stay free of store imports to avoid
 * a circular dependency (same reason api/client.ts reads the auth token raw).
 */
export function readPersistedLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE;
    const parsed = JSON.parse(raw) as { state?: { locale?: unknown } };
    return resolveLocale(parsed.state?.locale);
  } catch {
    return DEFAULT_LOCALE;
  }
}

interface LocaleState {
  /** The user's stored preference — may be 'kk' even while it is not runtime-usable. */
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (s) => ({ locale: s.locale }),
    },
  ),
);
