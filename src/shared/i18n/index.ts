import i18next, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { claimReload, isChunkLoadError } from '@/shared/lib/staleChunk';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, readPersistedLocale, resolveLocale } from '@/shared/store/locale';

// One namespace per product area. Mirror this list when adding a namespace, in
// both locales, and in the parity check (KZ-211 / KZ-602). `admin` covers
// /admin/* and `psychologist` the psychologist cabinet plus the specialist-only
// psych sections of /result — both were ru-only under KZ-210, and that
// decision was reversed on review: they are localized like any other area.
export const NAMESPACES = [
  'common',
  'auth',
  'onboarding',
  'assessment',
  'results',
  'profile',
  'errors',
  'landing',
  'admin',
  'psychologist',
  'psychReport',
] as const;

// Catalogs load on demand, one chunk per locale (vite.config manualChunks):
// a Russian-speaking visitor never downloads the Kazakh one, and the other
// way round apart from the ru fallback. main.tsx waits for `i18nReady`
// before the first render, so no component ever sees a missing namespace;
// a language switch loads the new catalog before i18next flips to it.
const catalogs = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json');

const lazyCatalogs: BackendModule = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const load = catalogs[`./locales/${language}/${namespace}.json`];
    if (!load) {
      callback(null, {});
      return;
    }
    load().then(
      (module) => callback(null, module.default),
      (error: Error) => {
        // A tab from before a deploy asking for a catalog that is gone: reload
        // once, as RouteErrorPage does for pages, instead of raw keys on screen.
        if (isChunkLoadError(error) && claimReload()) window.location.reload();
        callback(error, null);
      },
    );
  },
};

// Dev-only pseudo-locale: `?pseudo` in the URL wraps every resolved string in
// ⟦…⟧, so a hardcoded (un-t()'d) string shows up bracket-less on screen. Runs
// after interpolation, so ⟦Страница 2 из 8⟧ still reads. Never enabled in prod.
const PSEUDO =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('pseudo');

if (PSEUDO) {
  i18next.use({
    type: 'postProcessor',
    name: 'pseudo',
    process: (value: string) => `⟦${value}⟧`,
  });
}

export const i18nReady = i18next.use(lazyCatalogs).use(initReactI18next).init({
  lng: resolveLocale(readPersistedLocale()),
  fallbackLng: DEFAULT_LOCALE,
  postProcess: PSEUDO ? ['pseudo'] : [],
  // ['ru', 'kk'] since KZ-603. `revert` that change to drop back to ['ru'].
  supportedLngs: [...SUPPORTED_LOCALES],
  ns: [...NAMESPACES],
  defaultNS: 'common',
  // A missing kk key must render the ru string, never the key or "".
  returnEmptyString: false,
  interpolation: { escapeValue: false }, // React already escapes
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: import.meta.env.DEV
    ? (lngs, ns, key) => {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] missing key: ${ns}:${key} (${lngs.join(',')})`);
      }
    : undefined,
});
