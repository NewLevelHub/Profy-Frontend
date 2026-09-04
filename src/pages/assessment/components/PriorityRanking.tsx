import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { Button } from '@/shared/ui/Button';

export interface PriorityOption {
  id: string;
  text: string;
}

interface PriorityRankingProps {
  /** Exactly 3 options. Their list order is fixed and never re-sorts on
   *  screen — only the number badge next to each one changes as priorities
   *  are assigned (animating row order would animate the user's own answer). */
  options: PriorityOption[];
  /** Resume a saved answer — ids in priority order (e.g. from a previous
   *  visit to this question). Only read on mount. */
  initialRanking?: string[];
  /** Fires with the current ranking (ids in priority order) whenever it
   *  changes, including the implied 3rd slot once the first two are picked. */
  onChange?: (ranking: string[]) => void;
  /** Fires when "Дальше" is pressed; the button is disabled until all 3 are ranked. */
  onContinue: () => void;
  continueLabel?: string;
}

// Tapping an unranked option assigns it the next free priority number (1,
// then 2). The 3rd option is never independently tapped for its rank — once
// two are explicitly picked, the last remaining one is implied to be 3rd.
// So internal state only ever tracks 0-2 *explicit* picks; the full 3-item
// order shown on screen is derived from that.
function deriveExplicit(initial: string[] | undefined, options: PriorityOption[]): string[] {
  if (!initial || initial.length === 0) return [];
  const validIds = new Set(options.map(o => o.id));
  const explicit = initial.filter(id => validIds.has(id));
  // Drop a trailing implied 3rd pick if a full saved ranking was passed in —
  // it has no independent tap of its own, so we don't track it explicitly.
  return explicit.slice(0, options.length - 1);
}

function deriveDisplay(explicit: string[], options: PriorityOption[]): string[] {
  if (explicit.length !== options.length - 1) return explicit;
  const implied = options.find(o => !explicit.includes(o.id));
  return implied ? [...explicit, implied.id] : explicit;
}

export const PriorityRanking = React.memo(function PriorityRanking({
  options,
  initialRanking,
  onChange,
  onContinue,
  continueLabel,
}: PriorityRankingProps) {
  const { t } = useTranslation('assessment');
  const cLabel = continueLabel ?? t('priority.continue');
  const [explicit, setExplicit] = useState<string[]>(() => deriveExplicit(initialRanking, options));

  const ranking = useMemo(() => deriveDisplay(explicit, options), [explicit, options]);
  const isComplete = ranking.length === options.length;
  const remaining = options.length - ranking.length;

  function commit(nextExplicit: string[]) {
    setExplicit(nextExplicit);
    onChange?.(deriveDisplay(nextExplicit, options));
  }

  function handleTap(id: string) {
    playClick('soft');
    const explicitIdx = explicit.indexOf(id);

    if (explicitIdx !== -1) {
      // Already explicitly ranked — un-rank it and everything ranked after
      // it, so the order stays contiguous (never "1, 3" with 2 empty).
      commit(explicit.slice(0, explicitIdx));
      return;
    }

    if (explicit.length === options.length - 1) {
      // This is the implied last option — it has no tap of its own. Tapping
      // it undoes the most recent explicit pick that implied it.
      commit(explicit.slice(0, -1));
      return;
    }

    if (explicit.length >= options.length - 1) return; // safety guard
    commit([...explicit, id]);
  }

  function handleReset() {
    if (explicit.length === 0) return;
    playClick('soft');
    commit([]);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-[10px]">
        {options.map(option => {
          const position = ranking.indexOf(option.id);
          const isRanked = position !== -1;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleTap(option.id)}
              className={cn(
                'w-full flex items-center gap-[14px] text-left border-2 px-5 py-[18px] transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-brand',
                isRanked
                  ? 'border-brand bg-active-tint'
                  : 'border-default bg-surface text-primary hover:border-brand',
              )}
              style={{ borderRadius: 18 }}
              aria-label={
                isRanked
                  ? t('priority.rankedAria', { text: option.text, position: position + 1 })
                  : t('priority.unrankedAria', { text: option.text })
              }
            >
              <span
                className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black transition-colors duration-150"
                style={{
                  borderRadius: '50%',
                  fontSize: 15,
                  background: isRanked ? 'var(--pine)' : 'var(--bg-surface)',
                  color: isRanked ? '#fff' : 'var(--text-subtle)',
                  border: isRanked ? 'none' : '1.5px solid var(--hairline)',
                }}
              >
                {isRanked ? position + 1 : ''}
              </span>
              <span className="flex-1 font-bold text-primary leading-snug text-body-md">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={explicit.length === 0}
          className="font-semibold text-secondary text-body-sm underline underline-offset-4 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('priority.reset')}
        </button>
        {!isComplete && (
          <span className="text-caption text-secondary">
            {t('priority.remaining', { count: remaining })}
          </span>
        )}
      </div>

      <Button onClick={onContinue} disabled={!isComplete} size="lg" className="w-full rounded-pill">
        {cLabel}
      </Button>
    </div>
  );
});
