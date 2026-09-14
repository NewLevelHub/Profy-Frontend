import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoEmotionalStore, usePsychoColorRunStore } from '@/shared/store/psychoemotional';
import { psychoEmotionalApi } from '@/shared/api/psychoemotional';

/**
 * Логика финального экрана психоблока (PRO-3xx redesign): check-in → круг 2
 * → finish → генерация отчёта (`/assessment/loading`). Круг 1 уже отправлен
 * в начале прохождения (`usePsychoColorStart`, `/assessment/psychoemotional
 * -start`) — здесь только его `run_id` (в `usePsychoColorRunStore`, персистится)
 * и завершение той же строки. Шаг-машина этой страницы (checkin/circle2) — в
 * `usePsychoEmotionalStore` (не персистится: бросил → при следующем заходе
 * заново).
 */
export function usePsychoEmotional() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const runId = usePsychoColorRunStore((s) => s.runId);
  const runAssessmentId = usePsychoColorRunStore((s) => s.assessmentId);
  const resetRun = usePsychoColorRunStore((s) => s.reset);

  const step = usePsychoEmotionalStore((s) => s.step);
  const setCheckin = usePsychoEmotionalStore((s) => s.setCheckin);
  const reset = usePsychoEmotionalStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);
  const startedFresh = useRef(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    // Каждый заход в этот экран — с чистого листа (UX-край PRO-302).
    if (!startedFresh.current) {
      startedFresh.current = true;
      reset();
    }
  }, [assessmentId, navigate, reset]);

  async function submitAndContinue(list2: number[], list2DtMs: number[]) {
    setSubmitting(true);

    const s = usePsychoEmotionalStore.getState();
    try {
      // Круга 1 для этого прохождения нет (сеть подвела на старте, или это
      // старая вкладка) — отправлять круг 2 некому, секция /result просто
      // останется null (§5.6 — необязательное прохождение).
      if (assessmentId && runId && runAssessmentId === assessmentId) {
        await psychoEmotionalApi.finish(assessmentId, runId, {
          list2,
          list2_dt_ms: list2DtMs,
          checkin: s.checkin,
        });
        resetRun();
      }
    } catch {
      // Прохождение необязательно: секция /result просто останется null.
      // Не запираем пользователя на сетевой ошибке.
    } finally {
      reset();
      navigate('/assessment/loading');
    }
  }

  return {
    step,
    submitting,
    handleCheckin: setCheckin,
    handleCircle2: submitAndContinue,
  };
}
