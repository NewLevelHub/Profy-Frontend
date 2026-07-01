export function formatCost(cost: number | null): string {
  if (cost === null) return 'Стоимость не указана';
  return `${cost.toLocaleString()} $/год`;
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
