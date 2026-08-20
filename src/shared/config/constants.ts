export const ASSESSMENT_GOALS = {
  EXPLORE: 'explore',
  PROFESSION: 'profession',
  UNIVERSITY: 'university',
} as const;

export type AssessmentGoal = (typeof ASSESSMENT_GOALS)[keyof typeof ASSESSMENT_GOALS];

export const ASSESSMENT_GOAL_LABELS: Record<AssessmentGoal, string> = {
  [ASSESSMENT_GOALS.EXPLORE]: 'Исследовать варианты',
  [ASSESSMENT_GOALS.PROFESSION]: 'Выбрать профессию',
  [ASSESSMENT_GOALS.UNIVERSITY]: 'Выбрать университет',
};

export const RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

export const RIASEC_LABELS: Record<string, string> = {
  R: 'Реалистичный',
  I: 'Исследовательский',
  A: 'Артистичный',
  S: 'Социальный',
  E: 'Предприимчивый',
  C: 'Конвенциональный',
};

export const RIASEC_ICONS: Record<string, string> = {
  R: '🔧',
  I: '🔬',
  A: '🎨',
  S: '🤝',
  E: '🚀',
  C: '📋',
};

// Plain-language, one-sentence gloss for each RIASEC letter — the label
// alone ("Реалистичный", "Конвенциональный") is Holland-code jargon that
// doesn't explain itself to a student, so the type grid pairs it with this.
export const RIASEC_DESCRIPTIONS: Record<string, string> = {
  R: 'Нравится работать руками — техника, инструменты, что-то практическое',
  I: 'Нравится разбираться, как всё устроено, и искать ответы',
  A: 'Нравится придумывать и создавать своё — рисовать, писать, сочинять',
  S: 'Нравится помогать людям и быть рядом, когда нужна поддержка',
  E: 'Нравится вести за собой, убеждать и запускать свои идеи',
  C: 'Нравится порядок, чёткие правила и понятная структура',
};

// Junior's (6-9) interest instrument, replacing RIASEC — see MIType.
export const MI_TYPES = [
  'verbal', 'logical', 'musical', 'visual', 'bodily',
  'interpersonal', 'intrapersonal', 'naturalistic',
] as const;

export const MI_LABELS: Record<string, string> = {
  verbal: 'Слова и истории',
  logical: 'Логика и счёт',
  musical: 'Музыка и ритм',
  visual: 'Картинки и образы',
  bodily: 'Движение и руки',
  interpersonal: 'Дружба и команда',
  intrapersonal: 'Своё мнение',
  naturalistic: 'Природа и животные',
};

export const MI_ICONS: Record<string, string> = {
  verbal: '📚',
  logical: '🧩',
  musical: '🎵',
  visual: '🎨',
  bodily: '🤸',
  interpersonal: '🤝',
  intrapersonal: '💭',
  naturalistic: '🌿',
};

// One-sentence gloss per MI type — MI_LABELS are already plain Russian
// (unlike RIASEC's single-word jargon), but a short explanation still helps
// a junior student connect the label to what it actually looks like.
export const MI_DESCRIPTIONS: Record<string, string> = {
  verbal: 'Легко подбираешь слова, любишь читать и рассказывать истории',
  logical: 'Любишь считать, искать закономерности и решать задачи',
  musical: 'Чувствуешь ритм и мелодию лучше многих',
  visual: 'Мыслишь картинками — любишь рисовать и представлять образы',
  bodily: 'Легче учишься через движение, руками, на практике',
  interpersonal: 'Легко находишь общий язык и заряжаешься от компании',
  intrapersonal: 'Хорошо понимаешь себя и свои чувства',
  naturalistic: 'Замечаешь природу и то, что происходит вокруг',
};

export const LIKERT_SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'Очень не нравится' },
  { value: 2, label: 'Скорее не нравится' },
  { value: 3, label: 'Нейтрально' },
  { value: 4, label: 'Скорее нравится' },
  { value: 5, label: 'Очень нравится' },
];

export const BIGFIVE_LIKERT_SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'Очень Неточно' },
  { value: 2, label: 'Умеренно Неточно' },
  { value: 3, label: 'Ни Точно, Ни Неточно' },
  { value: 4, label: 'Умеренно Точно' },
  { value: 5, label: 'Очень Точно' },
];

export const THINKING_STYLE_LABELS: Record<string, string> = {
  creative_think: 'Творческое мышление',
  systematic: 'Системность',
  strategic: 'Стратегическое видение',
  practical: 'Практичность',
};

export const THINKING_STYLE_ICONS: Record<string, string> = {
  creative_think: '💡',
  systematic: '🗂️',
  strategic: '🧭',
  practical: '🔨',
};

export const PERSONALITY_LABELS: Record<string, string> = {
  openness: 'Открытость новому',
  conscientiousness: 'Организованность',
  extraversion: 'Общительность',
  agreeableness: 'Доброжелательность',
  emotional_stability: 'Эмоциональная устойчивость',
};

export const PERSONALITY_ICONS: Record<string, string> = {
  openness: '🌱',
  conscientiousness: '🗂️',
  extraversion: '🎉',
  agreeableness: '🤝',
  emotional_stability: '🧘',
};

export const PERSONALITY_ORDER: string[] = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability',
];

// interest_map[].level (result-v2 contract §5) — opaque enum, never a
// percentage: the backend deliberately doesn't expose the score it was
// computed from, so this is display-only.
export const INTEREST_LEVEL_LABELS: Record<'low' | 'medium' | 'high', string> = {
  low: 'Слабо выражено',
  medium: 'Средне выражено',
  high: 'Ярко выражено',
};

// careers[].tier (result-v2 contract §6) — three-tier match instead of a
// score, per TZ §18.3 (no percentages shown to the student).
export const CAREER_TIER_LABELS: Record<'strong' | 'good' | 'worth_trying', string> = {
  strong: 'Сильное совпадение',
  good: 'Хорошее совпадение',
  worth_trying: 'Стоит попробовать',
};

export const AGE_GROUPS = {
  JUNIOR: 'junior',
  MIDDLE: 'middle',
  SENIOR: 'senior',
} as const;

export type AgeGroup = (typeof AGE_GROUPS)[keyof typeof AGE_GROUPS];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  [AGE_GROUPS.JUNIOR]: '5–7 класс',
  [AGE_GROUPS.MIDDLE]: '8–9 класс',
  [AGE_GROUPS.SENIOR]: '10–11 класс',
};

export const ROADMAP_HORIZON_LABELS: Record<string, string> = {
  month_1: '1 месяц',
  months_3: '3 месяца',
  months_6: '6 месяцев',
  year_1: '1 год',
  until_goal: 'До цели',
};

export const ROADMAP_CATEGORY_LABELS: Record<string, string> = {
  study: 'Учёба',
  language: 'Язык',
  project: 'Проект',
  exam: 'Экзамен',
  explore: 'Исследование',
  achievement: 'Достижение',
  knowledge: 'Знания',
  skill: 'Навык',
  practice: 'Практика',
  portfolio: 'Портфолио',
  career: 'Карьера',
  education: 'Образование',
  planning: 'Планирование',
  documents: 'Документы',
  requirement: 'Требование',
  finance: 'Финансы',
  admission: 'Поступление',
  application: 'Заявка',
};

export const ROADMAP_CATEGORY_EMOJIS: Record<string, string> = {
  study: '📚',
  language: '🌍',
  project: '🛠️',
  exam: '📝',
  explore: '🔍',
  achievement: '🏆',
  knowledge: '💡',
  skill: '⚡',
  practice: '🔨',
  portfolio: '🗂️',
  career: '🚀',
  education: '🎓',
  planning: '🗓️',
  documents: '📄',
  requirement: '✅',
  finance: '💰',
  admission: '🏛️',
  application: '📨',
};

// ─── Direction roadmap (PRO-64) ────────────────────────────────────────────────

export const DIRECTION_HORIZON_LABELS: Record<string, string> = {
  months_3: '3 месяца',
  months_6: '6 месяцев',
  months_9: '9 месяцев',
  months_12: '12 месяцев',
};

export const DIRECTION_HORIZON_HINTS: Record<string, string> = {
  months_3: 'База и теория',
  months_6: 'Практика и выход из зоны комфорта',
  months_9: 'Интеграция навыков',
  months_12: 'Готовность к профильному пути',
};

export const STEP_TRACK_LABELS: Record<string, string> = {
  profile: 'Профиль',
  growth: 'Точка роста',
  integration: 'Интеграция',
};

export const DIRECTION_CATEGORY_LABELS: Record<string, string> = {
  knowledge: 'Знания',
  skill: 'Навык',
  practice: 'Практика',
  project: 'Проект',
  portfolio: 'Портфолио',
  soft_skill: 'Софт-скилл',
  subject: 'Предмет',
  community: 'Сообщество',
  exam: 'Экзамен',
  university: 'Вуз',
};

export const DIRECTION_CATEGORY_EMOJIS: Record<string, string> = {
  knowledge: '💡',
  skill: '⚡',
  practice: '🔨',
  project: '🛠️',
  portfolio: '🗂️',
  soft_skill: '🤝',
  subject: '📚',
  community: '👥',
  exam: '📝',
  university: '🎓',
};

export const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  hobby: 'Хобби',
  club: 'Кружок / секция',
  sport: 'Спорт',
  achievement: 'Достижение',
  goal: 'Цель',
  book: 'Книга',
  game: 'Игра',
  topic: 'Тема, которая интересует',
  profession: 'Профессия мечты',
  university: 'Желаемый университет',
  dream: 'Мечта',
};
