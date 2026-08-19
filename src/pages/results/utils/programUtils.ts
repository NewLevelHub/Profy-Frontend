export function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  return `${cost.toLocaleString()} $/год`;
}

export function convertLabelCurrenciesToUsd(label: string | null): string {
  if (!label) return 'Стоимость не указана';

  let currency: string | null = null;
  let rate = 1.0;
  let currencyWordPattern: RegExp | null = null;

  const lowLabel = label.toLowerCase();

  if (lowLabel.includes('kzt') || lowLabel.includes('тенге')) {
    currency = 'KZT';
    rate = 1 / 480;
    currencyWordPattern = /\bKZT\b|тенге/gi;
  } else if (lowLabel.includes('eur') || lowLabel.includes('евро')) {
    currency = 'EUR';
    rate = 1.09;
    currencyWordPattern = /\bEUR\b|евро/gi;
  } else if (lowLabel.includes('gbp') || lowLabel.includes('фунт')) {
    currency = 'GBP';
    rate = 1.30;
    currencyWordPattern = /\bGBP\b|фунт[а-я]*/gi;
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
  } else if (lowLabel.includes('krw') || lowLabel.includes('вон')) {
    currency = 'KRW';
    rate = 0.00075;
    currencyWordPattern = /\bKRW\b|вон[а-я]*/gi;
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
  } else if (lowLabel.includes('chf') || lowLabel.includes('франк')) {
    currency = 'CHF';
    rate = 1.14;
    currencyWordPattern = /\bCHF\b|франк[а-я]*/gi;
  } else if (lowLabel.includes('jpy') || lowLabel.includes('иен') || lowLabel.includes('йен')) {
    currency = 'JPY';
    rate = 0.0068;
    currencyWordPattern = /\bJPY\b|иен[а-я]*|йен[а-я]*/gi;
  } else if (lowLabel.includes('zar') || lowLabel.includes('рэнд') || lowLabel.includes('ранд')) {
    currency = 'ZAR';
    rate = 0.055;
    currencyWordPattern = /\bZAR\b|рэнд[а-я]*|ранд[а-я]*/gi;
  } else if (lowLabel.includes('brl') || lowLabel.includes('реал')) {
    currency = 'BRL';
    rate = 0.18;
    currencyWordPattern = /\bBRL\b|реал[а-я]*/gi;
  } else if (lowLabel.includes('usd') || lowLabel.includes('доллар')) {
    return label;
  }

  if (!currency || !currencyWordPattern) {
    return label;
  }

  const numberPattern = /\b\d[\d\s,.]*\b/g;

  let result = label.replace(numberPattern, (match) => {
    const cleaned = match.replace(/[\s,]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return match;
    const usd = Math.round(num * rate);
    return usd.toLocaleString('ru-RU');
  });

  result = result.replace(currencyWordPattern, 'USD');
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
