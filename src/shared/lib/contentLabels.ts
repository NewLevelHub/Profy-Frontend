import type { AgeGroup, BigFiveDomain, HollandType, Instrument, MIType, MotivationCategory, QuestionKeyed } from '@/shared/types';
import { KNOWN_LOCALES } from '@/shared/store/locale';
import type { Locale } from '@/shared/store/locale';

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  riasec: 'RIASEC',
  big_five: 'Big Five',
  mi: 'MI',
};

export const AGE_TIER_LABELS: Record<AgeGroup, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
};

/**
 * Code → i18n key, not code → text (KZ-202): the constant stays a plain index
 * and the wording lives in the catalog. Resolve at the use site with
 * `t(HOLLAND_TYPE_LABELS[code])`.
 */
export const HOLLAND_TYPE_LABELS: Record<HollandType, string> = {
  R: 'admin:holland.R',
  I: 'admin:holland.I',
  A: 'admin:holland.A',
  S: 'admin:holland.S',
  E: 'admin:holland.E',
  C: 'admin:holland.C',
};

export const BIGFIVE_DOMAIN_LABELS: Record<BigFiveDomain, string> = {
  N: 'admin:bigfive.N',
  E: 'admin:bigfive.E',
  O: 'admin:bigfive.O',
  A: 'admin:bigfive.A',
  C: 'admin:bigfive.C',
};

export const MI_TYPE_LABELS: Record<MIType, string> = {
  verbal: 'admin:mi.verbal',
  logical: 'admin:mi.logical',
  musical: 'admin:mi.musical',
  visual: 'admin:mi.visual',
  bodily: 'admin:mi.bodily',
  interpersonal: 'admin:mi.interpersonal',
  intrapersonal: 'admin:mi.intrapersonal',
  naturalistic: 'admin:mi.naturalistic',
};

export const QUESTION_KEYED_LABELS: Record<QuestionKeyed, string> = {
  plus: 'admin:keyed.plus',
  minus: 'admin:keyed.minus',
};

export const MOTIVATION_CATEGORY_LABELS: Record<MotivationCategory, string> = {
  interest: 'admin:motivation.interest',
  challenge: 'admin:motivation.challenge',
  helping: 'admin:motivation.helping',
  freedom: 'admin:motivation.freedom',
  money: 'admin:motivation.money',
  recognition: 'admin:motivation.recognition',
  stability: 'admin:motivation.stability',
  creation: 'admin:motivation.creation',
  teamwork: 'admin:motivation.teamwork',
};

/**
 * Locale of a bank-seeded content row. Since KZ-301 one logical content unit
 * is stored as one row per locale, so every admin content list shows both —
 * without this column the ru and kk copies of the same question are
 * indistinguishable, and it is not clear which one an edit will hit.
 */
export const CONTENT_LOCALE_LABELS: Record<Locale, string> = {
  ru: 'admin:locale.ru',
  kk: 'admin:locale.kk',
};

/** Compact form for the table cell, where the full name does not fit. */
export const CONTENT_LOCALE_SHORT: Record<Locale, string> = {
  ru: 'RU',
  kk: 'KK',
};

/**
 * Toolbar filter options — one per locale the content tables can hold.
 *
 * A factory rather than a constant: the labels are catalog keys now (KZ-202),
 * and a module-level constant has no `t` to resolve them with.
 */
export function contentLocaleOptions(t: (key: string) => string) {
  return KNOWN_LOCALES.map((locale) => ({
    value: locale,
    label: t(CONTENT_LOCALE_LABELS[locale]),
  }));
}
