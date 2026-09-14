import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoColorRunStore, hasPendingColorRun } from '@/shared/store/psychoemotional';
import { psychoEmotionalApi } from '@/shared/api/psychoemotional';

/**
 * Логика круга 1 (PRO-3xx redesign): один экран перед основной батареей
 * тестов. Отправляется сразу (`/psychoemotional/start`) — круг 2 и check-in
 * его дозаполнят в конце всего прохождения (`usePsychoEmotional`,
 * `/assessment/psychoemotional`).
 */
export function usePsychoColorStart() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const setRun = usePsychoColorRunStore((s) => s.setRun);

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
    setReady(true);
  }, [assessmentId, navigate]);

  async function handleCircle1(order: number[], dtMs: number[]) {
    setSubmitting(true);
    try {
      if (assessmentId) {
        const { run_id } = await psychoEmotionalApi.start(assessmentId, {
          list1: order,
          list1_dt_ms: dtMs,
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

  return { ready, submitting, handleCircle1 };
}
