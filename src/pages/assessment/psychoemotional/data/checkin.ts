/**
 * Check-in — 3 вопроса одним касанием (§5.2 / `forpsy/psychoemotional-content.md`
 * §1). Не оценивается, в формулы не входит. Пропуск допустим → «не указано».
 * Строки хардкод RU (i18n на `pro-282` нет; вынос в `psychEmotional` ns — PRO-310).
 */
export const SKIPPED = 'не указано';

export interface CheckInQuestion {
  key: 'q1' | 'q2' | 'q3';
  label: string;
  options: readonly string[];
}

export const CHECKIN_QUESTIONS: readonly CheckInQuestion[] = [
  {
    key: 'q1',
    label: 'Как ты себя чувствуешь сейчас?',
    options: ['спокойно', 'нормально', 'усталость', 'напряжение', 'раздражение'],
  },
  {
    key: 'q2',
    label: 'Выспаться этой ночью получилось?',
    options: ['да', 'не совсем', 'нет'],
  },
  {
    key: 'q3',
    label: 'Как проходит день?',
    options: ['обычно', 'хорошо', 'тяжело'],
  },
] as const;
