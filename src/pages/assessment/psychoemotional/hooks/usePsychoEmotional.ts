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
  const setRun = usePsychoColorRunStore((s) => s.setRun);

  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }

    let cancelled = false;
    async function reconcile() {
      try {
        const state = await psychoEmotionalApi.current(assessmentId!);
        if (cancelled) return;
        if (state.status === 'pending' && state.run_id) {
          setRun(assessmentId!, state.run_id, [], []);
          setReady(true);
          return;
        }
        resetRun();
        navigate('/assessment/loading', { replace: true });
      } catch {
        // A persisted ID is still useful while the state endpoint is
        // temporarily unavailable. Without one there is no run to finish.
        if (runId && runAssessmentId === assessmentId) {
          setReady(true);
        } else {
          navigate('/assessment/loading', { replace: true });
        }
      }
    }
    void reconcile();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, navigate, resetRun, runAssessmentId, runId, setRun]);

  async function submitAndContinue(list2: number[], list2DtMs: number[]) {
    setSubmitting(true);

    try {
      if (!assessmentId) return;
      const payload = { list2, list2_dt_ms: list2DtMs };
      let effectiveRunId = runAssessmentId === assessmentId ? runId : null;

      try {
        const state = await psychoEmotionalApi.current(assessmentId);
        if (state.status === 'completed') {
          resetRun();
          return;
        }
        effectiveRunId = state.status === 'pending' ? state.run_id : null;
      } catch {
        // Fall back to the persisted ID and let the idempotent finish decide.
      }

      if (!effectiveRunId) return;
      try {
        await psychoEmotionalApi.finish(assessmentId, effectiveRunId, payload);
        resetRun();
      } catch {
        // A lost finish response is ambiguous: the server may already have
        // completed the row. Reconcile, and retry only while it is pending.
        try {
          const state = await psychoEmotionalApi.current(assessmentId);
          if (state.status === 'completed') {
            resetRun();
          } else if (state.status === 'pending' && state.run_id) {
            await psychoEmotionalApi.finish(assessmentId, state.run_id, payload);
            resetRun();
          }
        } catch {
          // The psychoemotional block remains optional; report generation can
          // still proceed if the network is unavailable for both attempts.
        }
      }
    } finally {
      navigate('/assessment/loading');
    }
  }

  return {
    ready,
    submitting,
    handleCircle2: submitAndContinue,
  };
}
