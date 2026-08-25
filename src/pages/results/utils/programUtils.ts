import type { UniversityBrief } from '@/shared/types';

/**
 * Returns one label per rating scale the university actually has data for —
 * never merged into a single string. A university can legitimately appear on
 * two incomparable scales at once (a general cross-country ranking and a
 * KZ-only UniRanks position), so callers should render each entry as its own
 * chip rather than joining them. `ranking_label` itself also routinely packs
 * multiple ranking claims into one free-text string, comma/semicolon
 * separated (e.g. "#7 (QS World Rankings, 2026), #3 в мире по инженерии и
 * технологиям" — a global rank and a subject-specific one in the same
 * field), which both overflows the card as one chip and hides that these are
 * two different, non-comparable facts — so it's split into one chip per
 * clause. The split only fires at paren-depth 0, so the comma between a
 * rating name and its year inside "(QS World Rankings, 2026)" stays part of
 * the same clause instead of becoming its own chip. See
 * university-cards-ux-fix-plan.md §1/§3.
 */
/**
 * Splits on top-level `,`/`;` only — a separator *inside* parentheses (e.g.
 * the ", 2026" in "#3 (QS World University Rankings, 2026)") stays attached
 * to its clause instead of becoming its own chip.
 */
function splitClausesOutsideParens(text: string): string[] {
  const clauses: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of text) {
    if (char === '(') depth++;
    else if (char === ')') depth = Math.max(0, depth - 1);

    if ((char === ',' || char === ';') && depth === 0) {
      clauses.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  clauses.push(current);

  return clauses.map(clause => clause.trim()).filter(Boolean);
}

export function getUniversityRankingLabels(
  uni: Pick<UniversityBrief, 'ranking' | 'ranking_label' | 'uniranks_kz_rank' | 'uniranks_world_rank'>
): string[] {
  const labels: string[] = [];

  if (uni.ranking_label) {
    labels.push(...splitClausesOutsideParens(uni.ranking_label));
  } else if (uni.ranking !== null && uni.ranking !== undefined && uni.ranking > 0) {
    labels.push(`#${uni.ranking} в общем рейтинге`);
  }

  if (uni.uniranks_kz_rank !== null && uni.uniranks_kz_rank !== undefined && uni.uniranks_kz_rank > 0) {
    labels.push(
      uni.uniranks_world_rank
        ? `#${uni.uniranks_kz_rank} в РК / #${uni.uniranks_world_rank} в мире`
        : `#${uni.uniranks_kz_rank} в РК`
    );
  }

  return labels;
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

export function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  // `cost` sometimes arrives as a numeric-looking string (Decimal fields can
  // survive JSON as strings), and `"1659".toLocaleString()` is a no-op on a
  // string (returns it unchanged, no digit grouping) — coercing to Number
  // first is what actually applies grouping, and 'ru-RU' matches the space
  // grouping already used by convertLabelCurrenciesToUsd for the same
  // display purpose (see university-cards-ux-fix-plan.md §10).
  return `${Number(cost).toLocaleString('ru-RU')} $/год`;
}

export function convertLabelCurrenciesToUsd(label: string | null): string {
  if (!label) return 'Стоимость не указана';

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
    return usd.toLocaleString('ru-RU') + trailingWs;
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

const KEY_LABELS: Record<string, string> = {
  // Requirements
  exams: 'Вступительные экзамены',
  min_gpa: 'Минимальный GPA',
  min_sat: 'Минимальный балл SAT',
  min_ielts: 'Минимальный балл IELTS',
  min_toefl: 'Минимальный балл TOEFL',
  min_ent: 'Минимальный балл ЕНТ',
  needs_essay: 'Эссе',
  essay: 'Эссе',
  needs_interview: 'Собеседование',
  interview: 'Собеседование',
  needs_portfolio: 'Портфолио',
  portfolio: 'Портфолио',
  needs_recommendation: 'Рекомендательные письма',
  needs_recommendations: 'Рекомендательные письма',
  recommendation: 'Рекомендательное письмо',
  recommendations: 'Рекомендательные письма',
  language_certificate: 'Языковой сертификат',
  extracurriculars: 'Внеклассная деятельность',
  extracurricular: 'Внеклассная деятельность',
  activities: 'Дополнительные активности',
  leadership: 'Лидерские качества',
  community_service: 'Волонтёрство',
  research: 'Исследовательская работа',
  awards: 'Награды и достижения',
  gpa: 'GPA',
  sat: 'Балл SAT',
  act: 'Балл ACT',
  ielts: 'Балл IELTS',
  toefl: 'Балл TOEFL',
  ent: 'Балл ЕНТ',
  // Deadlines
  application: 'Подача заявки',
  application_open: 'Открытие приёма',
  application_close: 'Закрытие приёма',
  decision_date: 'Дата решения',
  exam_deadline: 'Срок сдачи экзаменов',
  documents: 'Документы',
  early_decision: 'Ранняя подача',
  regular: 'Основной срок',
  rolling: 'Скользящий срок',
  spring: 'Весенний набор',
  fall: 'Осенний набор',
};

export function localizeKey(key: string): string {
  const normalized = key.replace(/\s+/g, '_');
  return KEY_LABELS[key] ?? KEY_LABELS[normalized] ?? key.replace(/_/g, ' ');
}

export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(toDisplayString).join(', ');
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
  return Object.values(obj).filter(v => v !== null && v !== undefined).map(String).join(' · ') || '—';
}
