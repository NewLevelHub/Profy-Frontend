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

export const ASSESSMENT_BLOCKS = [
  'interests',
  'thinking',
  'personality',
  'motivation',
  'academic',
  'directions',
  'goal_clarification',
  'university',
] as const;

export const BLOCK_NAMES: Record<string, string> = {
  interests: 'Интересы',
  thinking: 'Стиль мышления',
  personality: 'Личность',
  motivation: 'Мотивация',
  academic: 'Учебные склонности',
  directions: 'Направления',
  goal_clarification: 'Твоя цель',
  university: 'Университет',
};

export const BLOCK_DESCRIPTIONS: Record<string, string> = {
  interests: 'Узнаем, что тебя по-настоящему интересует',
  thinking: 'Разберёмся, как ты думаешь и решаешь задачи',
  personality: 'Поймём твои сильные стороны характера',
  motivation: 'Выясним, что тебя вдохновляет и движет',
  academic: 'Посмотрим, какие предметы тебе ближе всего',
  directions: 'Определим подходящие профессиональные пути',
  goal_clarification: 'Уточним твою главную цель',
  university: 'Подберём университеты под твой профиль',
};

export const BLOCK_EMOJIS: Record<string, string> = {
  interests: '✨',
  thinking: '🧩',
  personality: '🦋',
  motivation: '🚀',
  academic: '📚',
  directions: '🧭',
  goal_clarification: '🎯',
  university: '🎓',
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
};

export const ROADMAP_CATEGORY_EMOJIS: Record<string, string> = {
  study: '📚',
  language: '🌍',
  project: '🛠️',
  exam: '📝',
  explore: '🔍',
  achievement: '🏆',
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
