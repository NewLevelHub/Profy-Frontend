import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, readPersistedLocale, resolveLocale } from '@/shared/store/locale';

import ruCommon from './locales/ru/common.json';
import ruAuth from './locales/ru/auth.json';
import ruOnboarding from './locales/ru/onboarding.json';
import ruAssessment from './locales/ru/assessment.json';
import ruResults from './locales/ru/results.json';
import ruRoadmap from './locales/ru/roadmap.json';
import ruProfile from './locales/ru/profile.json';
import ruErrors from './locales/ru/errors.json';

import kkCommon from './locales/kk/common.json';
import kkAuth from './locales/kk/auth.json';
import kkOnboarding from './locales/kk/onboarding.json';
import kkAssessment from './locales/kk/assessment.json';
import kkResults from './locales/kk/results.json';
import kkRoadmap from './locales/kk/roadmap.json';
import kkProfile from './locales/kk/profile.json';
import kkErrors from './locales/kk/errors.json';

// One namespace per product area. Mirror this list when adding a namespace, in
// both locales, and in the parity check (KZ-211 / KZ-602). Admin has no
// namespace — /admin/* is ru-only by decision (KZ-210).
export const NAMESPACES = [
  'common',
  'auth',
  'onboarding',
  'assessment',
  'results',
  'roadmap',
  'profile',
  'errors',
] as const;

const resources = {
  ru: {
    common: ruCommon,
    auth: ruAuth,
    onboarding: ruOnboarding,
    assessment: ruAssessment,
    results: ruResults,
    roadmap: ruRoadmap,
    profile: ruProfile,
    errors: ruErrors,
  },
  kk: {
    common: kkCommon,
    auth: kkAuth,
    onboarding: kkOnboarding,
    assessment: kkAssessment,
    results: kkResults,
    roadmap: kkRoadmap,
    profile: kkProfile,
    errors: kkErrors,
  },
} as const;

void i18next.use(initReactI18next).init({
  resources,
  lng: resolveLocale(readPersistedLocale()),
  fallbackLng: DEFAULT_LOCALE,
  // KZ-603 adds 'kk' to SUPPORTED_LOCALES; until then a stale persisted "kk"
  // (or a kk browser) still resolves to "ru" here.
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

export { default as i18n } from 'i18next';
