import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import type { AsturFigureAssemblyItem } from '@/shared/types';

interface FigureAssemblyQuestionProps {
  /** 1-based position, display only. */
  index: number;
  /** Image paths from the bank version's stimulus manifest, addressed by the
   *  item's own id (PRO-427 §12) — never derived from the position, so a
   *  reordered bank can't pair a picture with another item's key. */
  stimulus: AsturFigureAssemblyItem['stimulus'];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function FigureAssemblyQuestion({ index, stimulus, value, onChange }: FigureAssemblyQuestionProps) {
  const { t } = useTranslation('assessment');
  if (!stimulus) return null;
  const options = Object.entries(stimulus.options);
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
            <img src={`/${stimulus.target}`} alt={t('astur.figureAssemblyTarget')} className="max-h-full max-w-full object-contain" />
          </div>
          <span className="text-body-sm font-semibold text-muted">{t('astur.figureAssemblyTarget')}</span>
        </div>
        {options.map(([letter, path]) => {
          const selected = value === letter;
          return (
            <label
              key={letter}
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
                  onChange={() => onChange(letter)}
                  className="sr-only"
                />
                <img
                  src={`/${path}`}
                  alt={t('astur.figureAssemblyOption', { letter })}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className={cn('text-body-sm font-semibold', selected ? 'text-brand' : 'text-primary')}>
                {letter}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
