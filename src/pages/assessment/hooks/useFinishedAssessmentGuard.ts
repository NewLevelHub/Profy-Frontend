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
 * Флаг означает «отчёт готов» и выставляется только на ResultLoadingPage,
 * так что посреди прохождения он не сработает.
 */
export function useFinishedAssessmentGuard() {
  const navigate = useNavigate();
  const hasCompleted = useAssessmentStore((s) => s.hasCompletedAssessment);

  useEffect(() => {
    if (hasCompleted) navigate('/results', { replace: true });
  }, [hasCompleted, navigate]);

  return hasCompleted;
}
