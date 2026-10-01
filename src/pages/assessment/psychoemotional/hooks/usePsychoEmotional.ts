import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoColorRunStore } from '@/shared/store/psychoemotional';
import { psychoEmotionalApi } from '@/shared/api/psychoemotional';

/**
 * Логика финального экрана психоблока (PRO-3xx redesign): круг 2 → finish →
 * генерация отчёта (`/assessment/loading`). Check-in + круг 1 уже отправлены
 * в начале прохождения (`usePsychoColorStart`, `/assessment/psychoemotional
 * -start`, §B4 п.1-2) — здесь только их `run_id` (в `usePsychoColorRunStore`,
 * персистится) и завершение той же строки.
 */
export function usePsychoEmotional() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const runId = usePsychoColorRunStore((s) => s.runId);
  const runAssessmentId = usePsychoColorRunStore((s) => s.assessmentId);
  const resetRun = usePsychoColorRunStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
    }
  }, [assessmentId, navigate]);

  async function submitAndContinue(list2: number[], list2DtMs: number[]) {
    setSubmitting(true);

    try {
      // Круга 1 для этого прохождения нет (сеть подвела на старте, или это
      // старая вкладка) — отправлять круг 2 некому, секция /result просто
      // останется null (§5.6 — необязательное прохождение).
      if (assessmentId && runId && runAssessmentId === assessmentId) {
        await psychoEmotionalApi.finish(assessmentId, runId, {
          list2,
          list2_dt_ms: list2DtMs,
        });
        resetRun();
      }
    } catch {
      // Прохождение необязательно: секция /result просто останется null.
      // Не запираем пользователя на сетевой ошибке.
    } finally {
      navigate('/assessment/loading');
    }
  }

  return {
    submitting,
    handleCircle2: submitAndContinue,
  };
}
