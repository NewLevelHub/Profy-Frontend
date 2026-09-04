import type { AgeGroup, BigFiveDomain, HollandType, Instrument, MIType, MotivationCategory, QuestionKeyed } from '@/shared/types';

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

export const HOLLAND_TYPE_LABELS: Record<HollandType, string> = {
  R: 'R — Реалистичный',
  I: 'I — Исследовательский',
  A: 'A — Артистичный',
  S: 'S — Социальный',
  E: 'E — Предприимчивый',
  C: 'C — Конвенциональный',
};

export const BIGFIVE_DOMAIN_LABELS: Record<BigFiveDomain, string> = {
  N: 'N — Эмоциональная чувствительность',
  E: 'E — Экстраверсия',
  O: 'O — Открытость опыту',
  A: 'A — Доброжелательность',
  C: 'C — Добросовестность',
};

export const MI_TYPE_LABELS: Record<MIType, string> = {
  verbal: 'Слова и истории',
  logical: 'Логика и счёт',
  musical: 'Музыка и ритм',
  visual: 'Картинки и образы',
  bodily: 'Движение и руки',
  interpersonal: 'Дружба и команда',
  intrapersonal: 'Своё мнение',
  naturalistic: 'Природа и животные',
};

export const QUESTION_KEYED_LABELS: Record<QuestionKeyed, string> = {
  plus: 'Прямой (plus)',
  minus: 'Обратный (minus)',
};

export const MOTIVATION_CATEGORY_LABELS: Record<MotivationCategory, string> = {
  interest: 'Интерес к делу',
  challenge: 'Вызов и рост',
  helping: 'Польза другим',
  freedom: 'Свобода решений',
  money: 'Материальный результат',
  recognition: 'Признание',
  stability: 'Стабильность',
  creation: 'Создавать своё',
  teamwork: 'Команда',
};
