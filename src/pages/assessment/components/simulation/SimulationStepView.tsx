import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import type { SimulationStep } from '@/shared/types';

interface SimulationStepViewProps {
  step: SimulationStep;
  stepIndex: number;
  totalSteps: number;
  selectedOption: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
}

// Deliberately its own shape (scenario + consequence reveal), not the
// lettered OptionCard used by Akinator questions — this is a job preview,
// not "one more quiz screen".
export function SimulationStepView({
  step,
  stepIndex,
  totalSteps,
  selectedOption,
  onSelect,
  onNext,
}: SimulationStepViewProps) {
  const consequence = selectedOption !== null ? step.options[selectedOption]?.consequence : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === stepIndex ? 'w-6 bg-brand' : i < stepIndex ? 'w-1.5 bg-brand/50' : 'w-1.5 bg-brand-subtle',
            )}
          />
        ))}
      </div>

      <p className="font-bold text-primary leading-relaxed text-center" style={{ fontSize: 19 }}>
        {step.text}
      </p>

      <div className="flex flex-col gap-2.5">
        {step.options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              playClick('soft');
              onSelect(index);
            }}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-150',
              selectedOption === index
                ? 'border-brand bg-active-tint'
                : 'border-default bg-surface hover:border-[#C4B5FD]',
            )}
          >
            {option.text}
          </button>
        ))}
      </div>

      {consequence !== null && (
        <div className="rounded-xl bg-brand-subtle px-4 py-3 text-secondary font-medium text-caption">
          {consequence}
        </div>
      )}

      <button
        type="button"
        disabled={selectedOption === null}
        onClick={onNext}
        className={cn(
          'w-full rounded-pill py-3 font-bold transition-colors',
          selectedOption === null
            ? 'bg-brand-subtle text-muted cursor-not-allowed'
            : 'bg-brand text-on-brand hover:bg-brand-hover',
        )}
      >
        {stepIndex + 1 < totalSteps ? 'Дальше' : 'Продолжить'}
      </button>
    </div>
  );
}
