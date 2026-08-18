/** `costLabel` is a free-text fallback (range/mixed currency, e.g. "2 000 – 6 000
 * EUR в семестр") for programs where cost doesn't fit a single Decimal — shown
 * whenever there's no exact cost_per_year, so "Стоимость не указана" only
 * appears when the data is genuinely absent, not just unparseable. */
export function formatCost(cost: number | null, costLabel?: string | null): string {
  if (cost !== null) return `${cost.toLocaleString()} $/год`;
  if (costLabel) return costLabel;
  return 'Стоимость не указана';
}

/** Card-sized truncation for formatCost's output — some cost_label sources are
 * a full sentence, too long for a compact chip. Full text still shows on the
 * program detail page, which doesn't call this. */
export function truncateCost(formatted: string, maxLength = 60): string {
  return formatted.length > maxLength ? formatted.slice(0, maxLength) + '…' : formatted;
}

interface UniversityRankingFields {
  uniranks_kz_rank: number | null;
  ranking_label: string | null;
  ranking: number | null;
}

/** Best available rank signal for a university, in priority order:
 * national UNIRANKS position (most relevant for KZ universities) → a
 * pre-formatted QS-style label → a bare QS number. Returns null when there's
 * nothing worth showing (e.g. `uniranks_note` alone just means "not ranked",
 * not a badge-worthy fact). */
export function getRankingBadge(university: UniversityRankingFields): string | null {
  if (university.uniranks_kz_rank !== null) return `KZ #${university.uniranks_kz_rank}`;
  if (university.ranking_label) return university.ranking_label;
  if (university.ranking !== null) return `#${university.ranking} QS`;
  return null;
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
