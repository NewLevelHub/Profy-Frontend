import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';

interface FigureAssemblyQuestionProps {
  /** 1-based position within the subtest — the stimulus images for this
   *  question are `/astur-figures/{index}-{target|a|b|v|g}.png` (own
   *  brand-pine redraw, traced from the source stimulus sheet; see
   *  scripts/tools that generated them). */
  index: number;
  value: string | undefined;
  onChange: (value: string) => void;
}

const OPTIONS: { letter: string; file: string }[] = [
  { letter: 'А', file: 'a' },
  { letter: 'Б', file: 'b' },
  { letter: 'В', file: 'v' },
  { letter: 'Г', file: 'g' },
];

export function FigureAssemblyQuestion({ index, value, onChange }: FigureAssemblyQuestionProps) {
  const { t } = useTranslation('assessment');
  return (
    <div role="group" aria-labelledby={`figure-label-${index}`} className="flex flex-col gap-3">
      <p id={`figure-label-${index}`} className="text-body-md text-primary font-semibold">
        {index}. {t('astur.figureAssemblyPrompt')}
      </p>
      {/* theme-day: this is a scan-derived stimulus image, not app chrome —
          it must stay legible on its own light ground even in dark mode,
          same reasoning as theme.css's own .theme-day surfaces. */}
      <div className="theme-day flex flex-col sm:flex-row items-start gap-6">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border border-strong bg-raised p-4">
          <img src={`/astur-figures/${index}-target.png`} alt="Фигура-эталон" className="max-h-full max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {OPTIONS.map((option) => {
            const selected = value === option.letter;
            return (
              <label
                key={option.letter}
                className={cn(
                  'flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 cursor-pointer transition-colors',
                  selected ? 'border-brand bg-brand-subtle' : 'border-default hover:border-strong',
                )}
              >
                <input
                  type="radio"
                  name={`figure-${index}`}
                  checked={selected}
                  onChange={() => onChange(option.letter)}
                  className="sr-only"
                />
                <img
                  src={`/astur-figures/${index}-${option.file}.png`}
                  alt={`Вариант ${option.letter}`}
                  className="h-20 w-20 object-contain"
                />
                <span className="text-body-sm font-semibold text-primary">{option.letter}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
