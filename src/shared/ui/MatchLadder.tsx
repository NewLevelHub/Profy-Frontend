import { cn } from '@/shared/lib/cn';
import type { CareerTier } from '@/shared/types';

/**
 * Qualitative match-degree ladder — replaces every percent/numeric match
 * display in the product (design-system migration, /results goal-branching
 * task). Four tiers, never a number:
 *
 *   4  СИЛЬНО СОВПАДАЕТ           4/4 pine
 *   3  ХОРОШО СОВПАДАЕТ           3/4 pine + 1 hairline-outline
 *   2  ЧАСТИЧНО СОВПАДАЕТ         2/4 dawn + 2 hairline-outline
 *   1  СОВПАДАЕТ ОДНОЙ СТОРОНОЙ   1/4 mute + 3 hairline-outline
 *
 * There is deliberately no "not a match" tier — Clay never appears here.
 */
export type MatchLevel = 1 | 2 | 3 | 4;

const LEVEL_LABEL: Record<MatchLevel, string> = {
  4: 'СИЛЬНО СОВПАДАЕТ',
  3: 'ХОРОШО СОВПАДАЕТ',
  2: 'ЧАСТИЧНО СОВПАДАЕТ',
  1: 'СОВПАДАЕТ ОДНОЙ СТОРОНОЙ',
};

const LEVEL_FILL_COLOR: Record<MatchLevel, string> = {
  4: 'var(--pine)',
  3: 'var(--pine)',
  2: 'var(--dawn)',
  1: 'var(--mute)',
};

/**
 * `StudentCareer.tier` (result-v2 contract §6) is a 3-value enum
 * (strong/good/worth_trying) — one tier short of the 4-level ladder the
 * design calls for. There is no backend field anywhere that distinguishes
 * a 4th, weaker "one-sided" tier from `worth_trying`, so level 1
 * ("СОВПАДАЕТ ОДНОЙ СТОРОНОЙ") is currently unreachable from real career
 * data — it only exists in the ladder's visual vocabulary for scenario B's
 * hand-assembled "bridge" framing. Mapping documented here rather than
 * left implicit:
 *   strong        → 4 (СИЛЬНО СОВПАДАЕТ)
 *   good          → 3 (ХОРОШО СОВПАДАЕТ)
 *   worth_trying  → 2 (ЧАСТИЧНО СОВПАДАЕТ)
 * If the backend ever splits `worth_trying` into two real tiers, only this
 * function needs to change.
 */
export function careerTierToLevel(tier: CareerTier): MatchLevel {
  switch (tier) {
    case 'strong': return 4;
    case 'good': return 3;
    case 'worth_trying': return 2;
    default: return 2;
  }
}

export interface MatchLadderProps {
  level: MatchLevel;
  /** Render the qualitative label text next to the pills. Default true. */
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function MatchLadder({ level, showLabel = true, size = 'md', className }: MatchLadderProps) {
  const filledColor = LEVEL_FILL_COLOR[level];
  const pillW = size === 'sm' ? 5 : 6;
  const pillH = size === 'sm' ? 9 : 11;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="inline-flex items-center gap-[3px]" role="img" aria-label={LEVEL_LABEL[level]}>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block rounded-[1px]"
            style={{
              width: pillW,
              height: pillH,
              background: i <= level ? filledColor : 'transparent',
              border: i <= level ? 'none' : '1px solid var(--hairline)',
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span
          className={cn(
            'font-mono uppercase tracking-label font-bold whitespace-nowrap',
            size === 'sm' ? 'text-mono-xs' : 'text-mono-xs',
          )}
          style={{ color: filledColor }}
        >
          {LEVEL_LABEL[level]}
        </span>
      )}
    </div>
  );
}

/** Convenience wrapper for the common case of rendering straight off a career tier. */
export function CareerMatchLadder({ tier, ...rest }: { tier: CareerTier } & Omit<MatchLadderProps, 'level'>) {
  return <MatchLadder level={careerTierToLevel(tier)} {...rest} />;
}
