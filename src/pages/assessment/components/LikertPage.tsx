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

  return (
    <div className="flex flex-col gap-14">
      {questions.map(question => (
        <div key={question.id} className="flex flex-col gap-6">
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
