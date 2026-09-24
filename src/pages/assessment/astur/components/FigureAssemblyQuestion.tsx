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
    <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
      <legend className="text-body-md text-primary font-semibold">
        {index}. {t('astur.figureAssemblyPrompt')}
      </legend>
      {/* theme-day: this is a scan-derived stimulus image, not app chrome —
          it must stay legible on its own light ground even in dark mode,
          same reasoning as theme.css's own .theme-day surfaces.
          Single-row layout mirrors the original printed test sheet (эталон
          + А/Б/В/Г as five equal cells read left-to-right in one strip),
          rather than splitting the target into its own oversized card. */}
      <div className="theme-day flex gap-0 divide-x divide-default overflow-x-auto rounded-2xl border border-default bg-white">
        <div className="flex shrink-0 basis-1/5 flex-col items-center gap-2 p-3">
          <div className="flex aspect-square w-full min-w-[92px] items-center justify-center">
            <img src={`/astur-figures/${index}-target.png`} alt="Фигура-эталон" className="max-h-full max-w-full object-contain" />
          </div>
          <span className="text-body-sm font-semibold text-muted">Эталон</span>
        </div>
        {OPTIONS.map((option) => {
          const selected = value === option.letter;
          return (
            <label
              key={option.letter}
              className="flex shrink-0 basis-1/5 cursor-pointer flex-col items-center gap-2 p-3"
            >
              <div
                className={cn(
                  'flex aspect-square w-full min-w-[92px] items-center justify-center rounded-xl border-2 transition-colors',
                  selected ? 'border-brand' : 'border-transparent hover:border-strong',
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
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className={cn('text-body-sm font-semibold', selected ? 'text-brand' : 'text-primary')}>
                {option.letter}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
