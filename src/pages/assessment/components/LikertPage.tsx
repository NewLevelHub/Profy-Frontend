import { useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { LIKERT_SCALE, BIGFIVE_LIKERT_SCALE } from '@/shared/config/constants';
import type { Question } from '@/shared/types';
import { LikertScale } from './LikertScale';

interface LikertPageProps {
  questions: Question[];
  answers: Record<string, number>;
  onSelect: (questionId: string, value: number) => void;
  onSubmit: () => void;
  saving: boolean;
}

export function LikertPage({ questions, answers, onSelect, onSubmit, saving }: LikertPageProps) {
  const allAnswered = questions.every(question => answers[question.id] !== undefined);

  // The next unanswered question on this page — answering one "cuts" to
  // this one via a smooth scroll, guiding the eye down the page instead of
  // leaving the user to hunt for what's next among 5 stacked questions.
  // No opacity/position entrance animation here: every question is already
  // fully visible on screen (all 5 render at once), so animating one "in"
  // meant snapping an already-readable block to invisible and back — a
  // visible flicker rather than a transition.
  const activeQuestion = questions.find(question => answers[question.id] === undefined) ?? null;
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevActiveIdRef = useRef<string | null>(activeQuestion?.id ?? null);
  const justBecameActive = activeQuestion !== null && activeQuestion.id !== prevActiveIdRef.current;

  useEffect(() => {
    if (justBecameActive && activeQuestion) {
      const node = questionRefs.current[activeQuestion.id];
      const reducedMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      node?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
    prevActiveIdRef.current = activeQuestion?.id ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion?.id]);

  return (
    <div className="flex flex-col gap-28">
      {questions.map(question => (
        <div
          key={question.id}
          ref={el => {
            questionRefs.current[question.id] = el;
          }}
          className="flex flex-col gap-6 scroll-mt-24"
        >
          <p
            className="font-semibold leading-snug tracking-[-0.02em]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--midnight)',
            }}
          >
            {question.text}
          </p>
          <LikertScale
            selected={answers[question.id] ?? null}
            onSelect={value => onSelect(question.id, value)}
            scale={question.instrument === 'big_five' ? BIGFIVE_LIKERT_SCALE : LIKERT_SCALE}
          />
        </div>
      ))}

      <Button
        onClick={onSubmit}
        disabled={!allAnswered}
        isLoading={saving}
        size="lg"
        className="w-full max-w-[560px] mx-auto rounded-pill"
        style={{ height: 60, fontSize: 18, fontWeight: 800 }}
      >
        Далее
      </Button>
    </div>
  );
}
