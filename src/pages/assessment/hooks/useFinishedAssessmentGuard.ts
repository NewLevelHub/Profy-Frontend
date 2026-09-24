import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';

/**
 * Не пускает обратно в уже пройденный тест.
 *
 * Экраны визарда лежат вне AppLayout и каждый доступен по прямой ссылке.
 * У человека с завершённым тестом `/assessment` уводил внутрь опросника
 * («Вопрос 13 из 18», прогресс 72%) — то есть готовый результат
 * переоткрывался как незаконченный. Перепройти тест можно только
 * осознанно, через /assessment/goal: там `resetAssessment()` гасит этот
 * флаг и спрашивает подтверждение.
 *
 * `hasCompletedAssessment` also gets written by `syncFromServer` (not only
 * ResultLoadingPage, as an earlier version of this comment assumed) — a
 * stale `true` there (e.g. surviving from an earlier fully-completed
 * attempt) would fire this guard mid-test and kick the student to /results
 * with nothing to show. Cross-checking against the store's own live
 * progress counters (updated on every answer, so always fresh for the
 * *current* attempt) makes the guard self-healing against that, the same
 * defensive check useResults applies before trusting the flag for its own
 * pending-review gate.
 */
export function useFinishedAssessmentGuard() {
  const navigate = useNavigate();
  const hasCompletedFlag = useAssessmentStore((s) => s.hasCompletedAssessment);
  const answeredCount = useAssessmentStore((s) => s.answeredCount);
  const totalQuestions = useAssessmentStore((s) => s.totalQuestions);
  const motivationAnsweredCount = useAssessmentStore((s) => s.motivationAnsweredCount);
  const motivationTotal = useAssessmentStore((s) => s.motivationTotal);

  const hasCompleted =
    hasCompletedFlag &&
    totalQuestions > 0 && answeredCount >= totalQuestions &&
    motivationTotal > 0 && motivationAnsweredCount >= motivationTotal;

  useEffect(() => {
    if (hasCompleted) navigate('/results', { replace: true });
  }, [hasCompleted, navigate]);

  return hasCompleted;
}
