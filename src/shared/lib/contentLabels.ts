import type { AgeGroup, BigFiveDomain, HollandType, Instrument, MIType, MotivationCategory, QuestionKeyed, UserRole } from '@/shared/types';
import type { Locale } from '@/shared/store/locale';

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  riasec: 'RIASEC',
  big_five: 'Big Five',
  mi: 'MI',
  professional_types: 'ДДО (интересы)',
  professional_types_abilities: 'ДДО (способности)',
  eysenck: 'Айзенк',
  elers: 'Элерс',
  boyko_empathy: 'Бойко (эмпатия)',
  kondash_anxiety: 'Кондаш/Прихожан (тревожность)',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'Ученик',
  admin: 'Админ',
  psychologist: 'Психолог',
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
 * Full/compact labels for a bank-seeded content row's language, used by
 * `LocaleTabs` (the ru/kk view switcher on a content detail screen — one row
 * per question/pair/statement/direction holds both languages now, so which
 * one you're looking at is a view choice, not a row property).
 */
export const CONTENT_LOCALE_LABELS: Record<Locale, string> = {
  ru: 'admin:locale.ru',
  kk: 'admin:locale.kk',
};

/** Compact form for the tab button, where the full name does not fit. */
export const CONTENT_LOCALE_SHORT: Record<Locale, string> = {
  ru: 'RU',
  kk: 'KK',
};
