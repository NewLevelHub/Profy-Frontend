import { AsturQuestionHeading } from './AsturQuestionHeading';
import type { CSSProperties } from 'react';
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

/** A stimulus PNG drawn through `.stimulus-image` (alpha mask), so its lines
 *  follow the theme. Fills its box, keeping the picture's proportions. */
function StimulusImage({ path, label }: { path: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="stimulus-image h-full w-full"
      style={{ '--stimulus-src': `url("/${path}")` } as CSSProperties}
    />
  );
}

export function FigureAssemblyQuestion({ index, stimulus, value, onChange }: FigureAssemblyQuestionProps) {
  const { t } = useTranslation('assessment');
  if (!stimulus) return null;
  const options = Object.entries(stimulus.options);
  return (
    <div role="group" aria-labelledby={`figure-label-${index}`} className="flex flex-col gap-3">
      <AsturQuestionHeading index={index} id={`figure-label-${index}`}>{t('astur.figureAssemblyPrompt')}</AsturQuestionHeading>
      {/* The stimuli used to sit on a white theme-day plate in dark mode too —
          their lines were baked in dark. StimulusImage recolours them per
          theme instead, so the block is an ordinary surface.
          The target and all four options stay in one vertical composition:
          this avoids the old horizontal strip where the target scrolled out
          of view before the student reached the last options. */}
      <div className="rd-astur-geometry mx-auto flex w-full max-w-[600px] flex-col gap-3 rounded-[var(--radius)] border border-default bg-surface p-3 sm:p-4">
        <div className="flex flex-col items-center gap-2 border-b border-default pb-3">
          <div className="flex h-36 w-full items-center justify-center sm:h-44">
            <StimulusImage path={stimulus.target} label={t('astur.figureAssemblyTarget')} />
          </div>
          <span className="text-body-sm font-semibold text-muted">{t('astur.figureAssemblyTarget')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map(([letter, path]) => {
            const selected = value === letter;
            return (
              <label
                key={letter}
                data-selected={selected}
                className={cn(
                  'rd-astur-choice flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-[var(--radius)] border-2 p-2 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 sm:p-3',
                  selected ? 'border-brand bg-active-tint' : 'border-default hover:border-strong',
                )}
              >
                <input
                  type="radio"
                  name={`figure-${index}`}
                  checked={selected}
                  onChange={() => onChange(letter)}
                  className="sr-only"
                />
                <div className="flex h-28 w-full items-center justify-center sm:h-36">
                  <StimulusImage path={path} label={t('astur.figureAssemblyOption', { letter })} />
                </div>
                <span className={cn('text-body-sm font-semibold', selected ? 'text-brand' : 'text-primary')}>
                  {letter}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
