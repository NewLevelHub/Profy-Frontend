import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { macApi } from '@/shared/api/mac';
import type { MacCard, MacExerciseItem } from '@/shared/types';

type MacStep = 'loading' | 'stimulus' | 'drawing' | 'followup' | 'done';

/**
 * Логика блока МАК (PRO-316) — v1 demo: одно активное упражнение (E1),
 * `blind`-режим. Стимул → «Вытянуть карту» → карта раскрыта → свободный
 * текст на каждый наводящий вопрос (не пустой) → «Далее» → основной поток
 * (`/assessment/loading`). Никакого анализа/обратной связи сразу после блока
 * (§C1 / PRO-317) — лента собирается в `/result` в конце батареи.
 *
 * Сессия не персистится между заходами намеренно (как психоэмоц. блок,
 * PRO-306): бросил на середине — при следующем заходе get-or-create вернёт
 * ту же сессию с бэкенда, но текущий экран начнётся с начала активного
 * упражнения (ответ на E1 либо уже сохранён, либо не начат).
 */
export function useMac() {
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore((s) => s.assessmentId);

  const [step, setStep] = useState<MacStep>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<MacExerciseItem[]>([]);
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState<MacCard | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const revisionRef = useRef(0);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await macApi.createOrGetSession(assessmentId);
        if (cancelled) return;
        if (res.completed || res.exercises.length === 0) {
          // Уже пройдено, либо блок пуст (ни одного активного упражнения) —
          // не задерживаем на пустом экране.
          navigate('/assessment/loading', { replace: true });
          return;
        }
        setSessionId(res.session_id);
        setExercises(res.exercises);
        setAnswers(new Array(res.exercises[0].followup_questions.length).fill(''));
        setStep('stimulus');
      } catch {
        // Блок необязателен для основного отчёта — на сетевой ошибке просто
        // пропускаем его, не запираем пользователя (тот же приём, что в
        // психоэмоциональном блоке).
        navigate('/assessment/loading', { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, navigate]);

  const exercise = exercises[index] ?? null;

  const handleDraw = useCallback(async () => {
    if (!sessionId || !exercise) return;
    setStep('drawing');
    try {
      const drawn = await macApi.draw(sessionId, exercise.id);
      setCard(drawn);
      setStep('followup');
    } catch {
      setStep('stimulus'); // колода закончилась и т.п. — даём попробовать снова
    }
  }, [sessionId, exercise]);

  function handleAnswerChange(i: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    revisionRef.current += 1;
  }

  const canSubmit = answers.length > 0 && answers.every((a) => a.trim().length > 0);

  async function handleSubmit() {
    if (!sessionId || !exercise || !card || !canSubmit) return;
    setSubmitting(true);
    try {
      const result = await macApi.submitResponse({
        session_id: sessionId,
        exercise_id: exercise.id,
        card_ids: [card.id],
        followup_answers: answers,
        time_spent_ms: Date.now() - startedAtRef.current,
        revision_count: revisionRef.current,
      });

      const nextIndex = index + 1;
      if (result.session_completed || nextIndex >= exercises.length) {
        setStep('done');
        return;
      }
      setIndex(nextIndex);
      setCard(null);
      setAnswers(new Array(exercises[nextIndex].followup_questions.length).fill(''));
      startedAtRef.current = Date.now();
      revisionRef.current = 0;
      setStep('stimulus');
    } catch {
      setStep('done'); // не блокируем на сетевой ошибке — секция /result останется без этого ответа
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    navigate('/assessment/loading');
  }

  return {
    step,
    exercise,
    index,
    total: exercises.length,
    card,
    answers,
    submitting,
    canSubmit,
    handleDraw,
    handleAnswerChange,
    handleSubmit,
    handleContinue,
  };
}
