import i18next from 'i18next';

import { DEFAULT_LOCALE } from '@/shared/store/locale';
import { localizeGeo } from '@/shared/i18n/geo';

/**
 * Profile / onboarding data is stored as canonical **Russian** option strings
 * (subjects, hobbies, clubs, achievements, professions, target countries). The
 * onboarding catalog already carries the `kk` copy for the closed preset lists
 * (`onboarding.json` → `subject.*` and `preset.*`), keyed by that same ru
 * string — these helpers map a stored value to its localized display form.
 *
 * Free-text / "+ своё" entries aren't in the catalog and are returned
 * untouched. Everything is a no-op when the UI language is `ru`.
 */

// Canonical ru subject label → `onboarding.json` `subject.<key>`. Mirrors
// SUBJECT_OPTIONS in ProfileSetupPage (kept in sync by scripts/i18n-subjects.mjs).
const SUBJECT_KEY: Record<string, string> = {
  'Математика': 'math',
  'Физика': 'physics',
  'Химия': 'chemistry',
  'Биология': 'biology',
  'История': 'history',
  'География': 'geography',
  'Русский язык': 'russian',
  'Литература': 'literature',
  'Английский язык': 'english',
  'Информатика': 'informatics',
  'Физкультура': 'pe',
  'Рисование': 'art',
  'Музыка': 'music',
};

// Profile artifact `type` → `onboarding.json` `preset.<key>`. The onboarding
// "targets" step is saved as artifact type `university`, but its option list
// lives under `preset.target`.
const PRESET_KEY: Record<string, string> = {
  hobby: 'hobby',
  club: 'club',
  achievement: 'achievement',
  profession: 'profession',
  university: 'target',
};

function activeLng(): string {
  return i18next.language || DEFAULT_LOCALE;
}

/** Localized display form of a stored school-subject value. */
export function localizeSubject(value: string | null | undefined): string {
  if (!value) return '';
  if (activeLng() === DEFAULT_LOCALE) return value;
  const key = SUBJECT_KEY[value.trim()];
  return key
    ? i18next.t(`subject.${key}`, { ns: 'onboarding', defaultValue: value })
    : value;
}

/**
 * Localized display form of a stored artifact value (hobby / club /
 * achievement / profession / target). Falls back to the geo dictionary for
 * targets (mostly countries — a wider net than `preset.target`) and to the
 * raw value for anything the catalog doesn't know.
 */
export function localizeArtifactValue(
  type: string,
  value: string | null | undefined,
): string {
  if (!value) return '';
  if (activeLng() === DEFAULT_LOCALE) return value;
  const raw = value.trim();
  const presetKey = PRESET_KEY[type];
  if (presetKey && i18next.exists(`preset.${presetKey}.${raw}`, { ns: 'onboarding' })) {
    return i18next.t(`preset.${presetKey}.${raw}`, { ns: 'onboarding' });
  }
  if (type === 'university') return localizeGeo(raw);
  return value;
}

/** `localizeArtifactValue` mapped over a comma-joined display string. */
export function localizeArtifactList(
  type: string,
  values: readonly string[],
): string {
  return values.map((v) => localizeArtifactValue(type, v)).join(', ');
}
