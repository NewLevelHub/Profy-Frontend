import type { TFunction } from 'i18next';
import { formatNumber } from '@/shared/i18n/format';
import type { UniversityBrief } from '@/shared/types';

// These helpers render user-visible copy, so they take the caller's `t` (from
// `useTranslation`) rather than the `i18n` singleton — that keeps the calling
// component subscribed and re-rendering on `changeLanguage` (a bare
// `i18n.t()` here would freeze the string until some unrelated re-render).

/**
 * The card grid shows `university.image_url` in a ~380x128 box, but that URL
 * points at the full export (up to 1600px / ~2 MP). Compositing a dozen of
 * those per scroll tick is what makes the list stutter. `scripts/
 * generate_card_thumbnails.py` writes a `<slug>.card.webp` variant (~560px)
 * next to every `<slug>.webp`; this rewrites the URL to ask for it. The
 * caller must keep the original as an onError fallback so a missing variant
 * (thumbnail script not yet run, or a future S3 backend) degrades to the
 * full image instead of a broken one. When the API grows a real
 * `card_image_url` field, delete this and read the field.
 */
export function cardImageUrl(imageUrl: string): string {
  return imageUrl.replace(/\/universities\/([^/]+)\.webp$/, '/universities/$1.card.webp');
}

/**
 * One ranking chip, in a single unified shape for every university, so a card
 * never shows two differently-worded rank numbers side by side (the old code
 * could render "#8 (QS World Rankings 2026)" from `ranking_label` next to
 * "#12 в мире (UNIRANKS)" from `uniranks_world_rank` — two global ranks on two
 * incomparable scales, written two different ways).
 *
 * Product rule (chosen 2026-08-28, revised 2026-09-02): every displayed
 * number comes from ONE rating system, UniRanks Global Rank, so the chips
 * are comparable across universities. The consolidated backend now writes
 * that single number into `University.ranking` for every university it has
 * (see scripts/build_world_rank_map.py); `uniranks_world_rank` /
 * `uniranks_kz_rank` / the free-text `ranking_label` are no longer populated
 * by the pipeline and are only read here as legacy fallbacks. Every chip is
 * "UniRanks · #N в мире" — no per-country rank exists any more, and the
 * "QS World" label was wrong (that field never held a QS number after the
 * revision).
 *
 * Returns an array (0 or 1 entries) so the existing call sites
 * (UniversityRankBadges, ProgramDetailPage) don't need to change shape.
 */
export function getUniversityRankingLabels(
  uni: Pick<UniversityBrief, 'country' | 'ranking' | 'uniranks_kz_rank' | 'uniranks_world_rank'>,
  t: TFunction,
): string[] {
  const positive = (v: number | null | undefined): number | null =>
    v !== null && v !== undefined && v > 0 ? v : null;

  // `ranking` is the current single source (UniRanks Global Rank); the other
  // two are legacy and normally null.
  const worldRank = positive(uni.ranking) ?? positive(uni.uniranks_world_rank);
  const kzRank = positive(uni.uniranks_kz_rank);

  if (kzRank !== null) return [t('results:rank.kzPosition', { rank: kzRank })];
  if (worldRank !== null) return [t('results:rank.worldPosition', { rank: worldRank })];
  return [];
}

/**
 * Splits a university's free-text admission notes into separate requirement
 * phrases for rendering as individual cards instead of one wall of text.
 * Source data (universities_92_professions.py `requirements_text`) is
 * curated prose that packs multiple distinct requirements into one string,
 * e.g. "Диплом; языковые сертификаты IELTS 6.0-6.5+ / TOEFL 80+. Для
 * пилотов и диспетчеров — строгие медицинские тесты EASA." — split on `;`
 * and on a sentence-ending `.` (period followed by whitespace + a capital
 * letter, and NOT preceded by a digit, so "6.5" isn't treated as a
 * sentence boundary).
 */
export function splitRequirementNotes(notes: string[]): string[] {
  return notes
    .flatMap(note => note.split(/(?<!\d)\.\s+(?=[А-ЯA-ZӘҒҚҢӨҰҮҺІ])|;\s*/))
    .map(part => part.trim().replace(/\.$/, ''))
    .filter(part => part.length > 0);
}

export function formatCost(cost: number | null, t: TFunction): string {
  if (cost === null) return t('results:cost.notSpecified');
  // `cost` sometimes arrives as a numeric-looking string (Decimal fields can
  // survive JSON as strings), and `"1659".toLocaleString()` is a no-op on a
  // string (returns it unchanged, no digit grouping) — coercing to Number
  // first is what actually applies grouping. `formatNumber` groups per the
  // active UI locale (see KZ-104 / shared/i18n/format), keeping every price
  // on one style like convertLabelCurrenciesToUsd (university-cards-ux-fix-
  // plan.md §10).
  return t('results:cost.perYear', { amount: formatNumber(Number(cost)) });
}

export function convertLabelCurrenciesToUsd(label: string | null, t: TFunction): string {
  if (!label) return t('results:cost.notSpecified');

  let currency: string | null = null;
  let rate = 1.0;
  let currencyWordPattern: RegExp | null = null;

  const lowLabel = label.toLowerCase();

  // Some free-text prices use a currency symbol instead of a code/word (e.g.
  // "€2000–€3000" has no "EUR"/"евро" anywhere) — checked alongside the word
  // forms below so those don't slip through unconverted (see
  // university-cards-ux-fix-plan.md §10, and the TUM cost_label fixed in
  // scripts/backfill_strip_masters_domestic_cost.py that first surfaced this).
  if (lowLabel.includes('kzt') || lowLabel.includes('тенге') || label.includes('₸')) {
    currency = 'KZT';
    rate = 1 / 480;
    currencyWordPattern = /\bKZT\b|тенге|₸/gi;
  } else if (lowLabel.includes('eur') || lowLabel.includes('евро') || label.includes('€')) {
    currency = 'EUR';
    rate = 1.09;
    currencyWordPattern = /\bEUR\b|евро|€/gi;
  } else if (lowLabel.includes('gbp') || lowLabel.includes('фунт') || label.includes('£')) {
    currency = 'GBP';
    rate = 1.30;
    currencyWordPattern = /\bGBP\b|фунт[а-я]*|£/gi;
  } else if (lowLabel.includes('cny') || lowLabel.includes('юан')) {
    currency = 'CNY';
    rate = 0.14;
    currencyWordPattern = /\bCNY\b|юан[а-я]*/gi;
  } else if (lowLabel.includes('cad')) {
    currency = 'CAD';
    rate = 0.73;
    currencyWordPattern = /\bCAD\b/gi;
  } else if (lowLabel.includes('sgd')) {
    currency = 'SGD';
    rate = 0.74;
    currencyWordPattern = /\bSGD\b/gi;
  } else if (lowLabel.includes('hkd')) {
    currency = 'HKD';
    rate = 0.13;
    currencyWordPattern = /\bHKD\b/gi;
  } else if (lowLabel.includes('krw') || lowLabel.includes('вон') || label.includes('₩')) {
    currency = 'KRW';
    rate = 0.00075;
    currencyWordPattern = /\bKRW\b|вон[а-я]*|₩/gi;
  } else if (lowLabel.includes('aud')) {
    currency = 'AUD';
    rate = 0.65;
    currencyWordPattern = /\bAUD\b/gi;
  } else if (lowLabel.includes('sek') || lowLabel.includes('крон')) {
    currency = 'SEK';
    rate = 0.095;
    currencyWordPattern = /\bSEK\b|крон[а-я]*/gi;
  } else if (lowLabel.includes('nok')) {
    currency = 'NOK';
    rate = 0.093;
    currencyWordPattern = /\bNOK\b/gi;
  } else if (lowLabel.includes('nzd')) {
    currency = 'NZD';
    rate = 0.606;
    currencyWordPattern = /\bNZD\b/gi;
  } else if (lowLabel.includes('inr') || lowLabel.includes('рупи')) {
    currency = 'INR';
    rate = 0.0119;
    currencyWordPattern = /\bINR\b|рупи[а-я]*/gi;
  } else if (lowLabel.includes('chf') || lowLabel.includes('франк')) {
    currency = 'CHF';
    rate = 1.14;
    currencyWordPattern = /\bCHF\b|франк[а-я]*/gi;
  } else if (lowLabel.includes('jpy') || lowLabel.includes('иен') || lowLabel.includes('йен') || label.includes('¥')) {
    currency = 'JPY';
    rate = 0.0068;
    currencyWordPattern = /\bJPY\b|иен[а-я]*|йен[а-я]*|¥/gi;
  } else if (lowLabel.includes('zar') || lowLabel.includes('рэнд') || lowLabel.includes('ранд')) {
    currency = 'ZAR';
    rate = 0.055;
    currencyWordPattern = /\bZAR\b|рэнд[а-я]*|ранд[а-я]*/gi;
  } else if (lowLabel.includes('brl') || lowLabel.includes('реал')) {
    currency = 'BRL';
    rate = 0.18;
    currencyWordPattern = /\bBRL\b|реал[а-я]*/gi;
  } else if (lowLabel.includes('usd') || lowLabel.includes('доллар') || label.includes('$')) {
    // Already USD — still worth a pass: raw source text can say "USD" as a
    // word (not "$"), or have ungrouped digits ("49400" instead of "49 400")
    // — falling through to the shared formatting below instead of an early
    // return keeps every price on the same visual style (see
    // university-cards-ux-fix-plan.md §10).
    currency = 'USD';
    rate = 1.0;
    currencyWordPattern = /\bUSD\b|доллар[а-я]*|\$/gi;
  }

  if (!currency || !currencyWordPattern) {
    return label;
  }

  const numberPattern = /\b\d[\d\s,.]*\b/g;

  let result = label.replace(numberPattern, (match) => {
    // The char class includes \s so an already-grouped number ("49 400") is
    // parsed as one number, not two — but that same greediness also lets the
    // match swallow whitespace *after* the number that belongs to the rest
    // of the sentence (e.g. the space before a following "USD"), and \b then
    // closes the match right there. Re-attaching that trailing whitespace
    // after formatting is what keeps "49400 USD" from losing its space and
    // becoming "49 400USD".
    const trailingWs = match.match(/\s+$/)?.[0] ?? '';
    const cleaned = match.replace(/[\s,]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return match;
    const usd = Math.round(num * rate);
    return formatNumber(usd) + trailingWs;
  });

  // Every currency, whatever the source used (a code like "EUR", a Cyrillic
  // word like "евро", or a symbol like "€"/"£"/"¥"), collapses to the same
  // "$" mark so every card reads the same way — a source's word/symbol
  // sometimes sits before the number ("€2000") and sometimes after
  // ("20000 USD"), so the two follow-up passes fix spacing in whichever
  // direction is actually needed rather than assuming one.
  result = result.replace(currencyWordPattern, () => '$');
  result = result.replace(/(\d)\$/g, (_m, digit) => `${digit} $`); // suffix form: digit hard against $ -> add a space
  result = result.replace(/\$(\s*)(\d)/g, (_m, _ws, digit) => `$${digit}`); // prefix form: drop any space between $ and the number
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

// Maps a raw requirement/deadline key to its i18n key under results/reqKey.*
// (a fixed enum of shapes the backend uses — the ru/kk copy lives in the
// catalog, resolved via `i18n.t` in localizeKey below).
const KEY_LABELS: Record<string, string> = {
  // Requirements
  exams: 'results:reqKey.exams',
  min_gpa: 'results:reqKey.min_gpa',
  min_sat: 'results:reqKey.min_sat',
  min_ielts: 'results:reqKey.min_ielts',
  min_toefl: 'results:reqKey.min_toefl',
  min_ent: 'results:reqKey.min_ent',
  needs_essay: 'results:reqKey.needs_essay',
  essay: 'results:reqKey.essay',
  needs_interview: 'results:reqKey.needs_interview',
  interview: 'results:reqKey.interview',
  needs_portfolio: 'results:reqKey.needs_portfolio',
  portfolio: 'results:reqKey.portfolio',
  needs_recommendation: 'results:reqKey.needs_recommendation',
  needs_recommendations: 'results:reqKey.needs_recommendations',
  recommendation: 'results:reqKey.recommendation',
  recommendations: 'results:reqKey.recommendations',
  language_certificate: 'results:reqKey.language_certificate',
  extracurriculars: 'results:reqKey.extracurriculars',
  extracurricular: 'results:reqKey.extracurricular',
  activities: 'results:reqKey.activities',
  leadership: 'results:reqKey.leadership',
  community_service: 'results:reqKey.community_service',
  research: 'results:reqKey.research',
  awards: 'results:reqKey.awards',
  gpa: 'results:reqKey.gpa',
  sat: 'results:reqKey.sat',
  act: 'results:reqKey.act',
  ielts: 'results:reqKey.ielts',
  toefl: 'results:reqKey.toefl',
  ent: 'results:reqKey.ent',
  // Deadlines
  application: 'results:reqKey.application',
  application_open: 'results:reqKey.application_open',
  application_close: 'results:reqKey.application_close',
  decision_date: 'results:reqKey.decision_date',
  exam_deadline: 'results:reqKey.exam_deadline',
  documents: 'results:reqKey.documents',
  early_decision: 'results:reqKey.early_decision',
  regular: 'results:reqKey.regular',
  rolling: 'results:reqKey.rolling',
  spring: 'results:reqKey.spring',
  fall: 'results:reqKey.fall',
};

export function localizeKey(key: string, t: TFunction): string {
  const normalized = key.replace(/\s+/g, '_');
  const i18nKey = KEY_LABELS[key] ?? KEY_LABELS[normalized];
  return i18nKey ? t(i18nKey) : key.replace(/_/g, ' ');
}

export function toDisplayString(value: unknown, t: TFunction): string {
  if (value === null || value === undefined) return t('common:emptyValue');
  if (typeof value === 'boolean') return value ? t('common:yes') : t('common:no');
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map((v) => toDisplayString(v, t)).join(', ');
  const obj = value as Record<string, unknown>;
  const preferred = ['amount', 'value', 'score', 'level', 'min', 'conditions', 'name'];
  for (const field of preferred) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const rest = obj.conditions !== undefined && field !== 'conditions'
        ? ` · ${String(obj.conditions)}`
        : '';
      return `${String(obj[field])}${rest}`;
    }
  }
  return Object.values(obj).filter(v => v !== null && v !== undefined).map(String).join(' · ') || t('common:emptyValue');
}
