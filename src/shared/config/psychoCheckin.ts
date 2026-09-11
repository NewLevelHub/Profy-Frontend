/**
 * Check-in — 3 вопроса одним касанием (§5.2 / `forpsy/psychoemotional-content.md`
 * §1). Не оценивается, в формулы не входит. Пропуск допустим → «не указано».
 * Единый источник: прохождение (`pages/assessment/psychoemotional`) и разбор
 * в отчёте (`pages/results/components/psych/PsychoEmotionalSection`) читают
 * вопросы отсюда — так `checkin.q1/q2/q3` в отчёте разворачивается в текст
 * вопроса, а не в сырой ключ.
 *
 * Строки хардкод RU (i18n на психоблоке нет; PRO-293 — `psychEmotional` ns).
 */
export const CHECKIN_SKIPPED = 'не указано';

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

export const CHECKIN_QUESTION_BY_KEY: Readonly<Record<string, CheckInQuestion>> =
  Object.fromEntries(CHECKIN_QUESTIONS.map((q) => [q.key, q]));
