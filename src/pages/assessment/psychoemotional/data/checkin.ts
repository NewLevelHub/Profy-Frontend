/**
 * Check-in — 3 вопроса одним касанием (§5.2 / `forpsy/psychoemotional-content.md`
 * §1). Вопросы (id → label/options) живут в `@/shared/config/psychoCheckin`
 * (её же читает разбор в отчёте) и ре-экспортируются отсюда.
 */
export {
  type CheckInQuestion,
  CHECKIN_QUESTIONS,
  CHECKIN_QUESTION_BY_KEY,
  CHECKIN_SKIPPED as SKIPPED,
} from '@/shared/config/psychoCheckin';
