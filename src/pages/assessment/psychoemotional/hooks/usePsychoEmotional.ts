import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoEmotionalStore } from '@/shared/store/psychoemotional';
import { psychoEmotionalApi } from '@/shared/api/psychoemotional';

/**
 * Логика блока психоэмоционального теста (PRO-306): checkin → круг 1 → пауза
 * → круг 2 → submit → основной поток (`/assessment/loading`). Никакого
 * результата пользователю (§5.6). Состояние прохождения — в
 * `usePsychoEmotionalStore` (не персистится: бросил → при следующем заходе
 * заново).
 */
export function usePsychoEmotional() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);

  const step = usePsychoEmotionalStore((s) => s.step);
  const pauseStartedAt = usePsychoEmotionalStore((s) => s.pauseStartedAt);
  const setCheckin = usePsychoEmotionalStore((s) => s.setCheckin);
  const recordCircle1 = usePsychoEmotionalStore((s) => s.recordCircle1);
  const finishPause = usePsychoEmotionalStore((s) => s.finishPause);
  const recordCircle2 = usePsychoEmotionalStore((s) => s.recordCircle2);
  const reset = usePsychoEmotionalStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);
  const startedFresh = useRef(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    // Каждый заход в блок — с чистого листа (UX-край PRO-302).
    if (!startedFresh.current) {
      startedFresh.current = true;
      reset();
    }
  }, [assessmentId, navigate, reset]);

  async function submitAndContinue(list2: number[], list2DtMs: number[]) {
    recordCircle2(list2, list2DtMs);
    setSubmitting(true);

    const s = usePsychoEmotionalStore.getState();
    try {
      if (assessmentId) {
        await psychoEmotionalApi.submit(assessmentId, {
          list1: s.list1,
          list2,
          list1_dt_ms: s.list1DtMs,
          list2_dt_ms: list2DtMs,
          pause_actual_sec: s.pauseActualSec ?? 0,
          checkin: s.checkin,
        });
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
    pauseStartedAt,
    submitting,
    handleCheckin: setCheckin,
    handleCircle1: recordCircle1,
    handlePauseContinue: finishPause,
    handleCircle2: submitAndContinue,
  };
}
