import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoColorRunStore, usePsychoStartStore, hasPendingColorRun } from '@/shared/store/psychoemotional';
import { psychoEmotionalApi } from '@/shared/api/psychoemotional';

/**
 * Логика стартового экрана психоблока (PRO-3xx redesign, §B4 п.1-2): check-in
 * → круг 1, перед основной батареей тестов. Отправляются вместе, за один раз
 * (`/psychoemotional/start`) — круг 2 их дозаполнит в конце всего
 * прохождения (`usePsychoEmotional`, `/assessment/psychoemotional`). Шаг-машина
 * (checkin/circle1) — в `usePsychoStartStore` (не персистится: бросил → при
 * следующем заходе заново).
 */
export function usePsychoColorStart() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const setRun = usePsychoColorRunStore((s) => s.setRun);

  const step = usePsychoStartStore((s) => s.step);
  const setCheckin = usePsychoStartStore((s) => s.setCheckin);
  const resetStep = usePsychoStartStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (hasPendingColorRun(assessmentId)) {
      // Это прохождение уже начинало круг 1 (resume) — не повторяем его,
      // круг 2 в конце всё равно завершит тот же run.
      navigate('/assessment', { replace: true });
      return;
    }
    // Каждый заход на этот экран — с чистого листа (UX-край PRO-302, тот же
    // что у финального экрана).
    resetStep();
    setReady(true);
  }, [assessmentId, navigate, resetStep]);

  async function handleCircle1(order: number[], dtMs: number[]) {
    setSubmitting(true);
    try {
      if (assessmentId) {
        const { checkin } = usePsychoStartStore.getState();
        const { run_id } = await psychoEmotionalApi.start(assessmentId, {
          list1: order,
          list1_dt_ms: dtMs,
          checkin,
        });
        setRun(assessmentId, run_id, order, dtMs);
      }
    } catch {
      // Прохождение необязательно: если старт не сохранился, в конце просто
      // не будет run_id для finish — не запираем пользователя на сетевой ошибке.
    } finally {
      navigate('/assessment');
    }
  }

  return { ready, submitting, step, handleCheckin: setCheckin, handleCircle1 };
}
