import { useState } from 'react';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button';
import type { AkinatorTurnResponse, RevealLeaf } from '@/shared/types';
import { useSimulation } from '../../hooks/useSimulation';
import { SimulationStepView } from './SimulationStepView';
import { SimulationDecision } from './SimulationDecision';

interface SimulationCardProps {
  assessmentId: string;
  leaf: RevealLeaf;
  onAccept: (note: string | null) => void;
  onReject: (turn: AkinatorTurnResponse | null) => void;
  onCancel: () => void;
}

// RJP simulation — a separate entry point from the cluster resolver, opened
// only by an explicit "Нравится" on a specific reveal leaf (see RevealCard /
// useAkinatorAssessment.handleLikeLeaf). Owns its own step/decision state so
// it never gets folded into the generic akinator question loop.
export function SimulationCard({ assessmentId, leaf, onAccept, onReject, onCancel }: SimulationCardProps) {
  const { steps, isLoading, error, notFound, submit, isSubmitting, submitError } = useSimulation(
    assessmentId, leaf.slug
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const atDecision = steps.length > 0 && stepIndex >= steps.length;

  function handleNext() {
    if (selectedOption === null) return;
    setAnswers(prev => [...prev, selectedOption]);
    setSelectedOption(null);
    setStepIndex(i => i + 1);
  }

  async function handleAccept(note: string | null) {
    await submit({ accepted: true, answers });
    onAccept(note);
  }

  async function handleReject() {
    const result = await submit({ accepted: false, answers });
    onReject(result.akinator_turn);
  }

  return (
    <div
      className="w-full max-w-xl bg-surface rounded-[24px] p-6 lg:p-8 flex flex-col gap-6"
      style={{ boxShadow: '0 10px 30px rgba(30,27,75,.04)', border: '1px solid #EDE9FE' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-brand tracking-[.02em]" style={{ fontSize: 13 }}>
          🎬 ПРОБА ПРОФЕССИИ
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Закрыть пробу"
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:bg-raised transition-colors"
        >
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <Spinner size="lg" />
        </div>
      ) : notFound ? (
        // Content coverage is still partial (only a handful of professions
        // have a written scenario) — a missing simulation must never block
        // choosing the profession, so fall back to a plain accept/reject.
        <div className="flex flex-col gap-5 text-center py-2">
          <p className="text-secondary font-semibold">
            Для «{leaf.name}» пока нет интерактивной пробы дня — но ты всё равно можешь её выбрать.
          </p>
          {submitError && (
            <p className="text-danger text-caption text-center font-semibold">
              Не удалось сохранить решение. Попробуй ещё раз.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full rounded-pill"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => handleAccept(null)}
            >
              👍 Выбрать «{leaf.name}»
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full rounded-pill"
              disabled={isSubmitting}
              onClick={handleReject}
            >
              Не моё — покажи другое
            </Button>
          </div>
        </div>
      ) : error || steps.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-secondary font-semibold">Не удалось загрузить пробу профессии.</p>
          <Button variant="ghost" onClick={onCancel}>Вернуться к результатам</Button>
        </div>
      ) : atDecision ? (
        <>
          {submitError && (
            <p className="text-danger text-caption text-center font-semibold">
              Не удалось сохранить решение. Попробуй ещё раз.
            </p>
          )}
          <SimulationDecision
            leafName={leaf.name}
            submitting={isSubmitting}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </>
      ) : (
        <SimulationStepView
          step={steps[stepIndex]}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
