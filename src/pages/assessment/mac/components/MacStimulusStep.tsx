import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Heading } from '@/shared/ui/typography/Heading';
import type { MacCard, MacExerciseItem } from '@/shared/types';

interface MacStimulusStepProps {
  exercise: MacExerciseItem;
  drawing: boolean;
  card: MacCard | null;
  answers: string[];
  canSubmit: boolean;
  submitting: boolean;
  onDraw: () => void;
  onAnswerChange: (index: number, value: string) => void;
  onSubmit: () => void;
}

/**
 * Одно упражнение МАК: вопрос-стимул → «Вытянуть карту» (`blind`) → карта
 * раскрыта → свободный текст на каждый наводящий вопрос (пустое поле не
 * пропускает «Далее», §C1/PRO-316 AC). Ничего не оценивается и не
 * интерпретируется на этом экране.
 */
export function MacStimulusStep({
  exercise,
  drawing,
  card,
  answers,
  canSubmit,
  submitting,
  onDraw,
  onAnswerChange,
  onSubmit,
}: MacStimulusStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Heading level="display-sm" as="h2" className="text-primary text-center">
        {exercise.stimulus_question}
      </Heading>

      {!card ? (
        <div className="flex flex-col items-center gap-5 py-2">
          {drawing ? (
            <Skeleton className="h-[220px] w-[160px] rounded-xl" />
          ) : (
            <div
              className="flex h-[220px] w-[160px] items-center justify-center rounded-xl border border-dashed border-default text-4xl"
            >
              🂠
            </div>
          )}
          <Button onClick={onDraw} disabled={drawing} size="lg" className="w-full rounded-pill">
            {drawing ? 'Тянем карту…' : 'Вытянуть карту'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <img
            src={card.image_url}
            alt=""
            className="mx-auto h-auto w-[200px] rounded-xl border border-default object-cover"
            style={{ boxShadow: 'var(--shadow-pop)' }}
          />
          <div className="flex flex-col gap-4">
            {exercise.followup_questions.map((q, i) => (
              <label key={i} className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium text-primary">{q}</span>
                <textarea
                  value={answers[i] ?? ''}
                  onChange={(e) => onAnswerChange(i, e.target.value)}
                  rows={3}
                  placeholder="Напиши пару предложений…"
                  className="rounded-lg border border-default bg-surface p-3 text-body-sm text-primary outline-none transition-colors focus:border-brand"
                />
              </label>
            ))}
          </div>
          <Button onClick={onSubmit} disabled={!canSubmit || submitting} size="lg" className="w-full rounded-pill">
            {submitting ? 'Сохраняем…' : 'Далее'}
          </Button>
        </div>
      )}
    </div>
  );
}
