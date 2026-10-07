import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

interface StenProgressBarProps {
  value: number;
  min: number;
  max: number;
  /** Inclusive normative range, highlighted on the track (Ф1.11: сомнения
   *  сten 4-6 — оптимальная зона, не "больше = лучше"). */
  normativeFrom: number;
  normativeTo: number;
  className?: string;
}

function position(v: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}

/**
 * Linear 1-10 sten scale with a highlighted normative band — distinct from
 * `GaugeChart` (a semicircular speedometer used for Elers' unbounded-good
 * 0-32 scale): this ticket asks for a separate linear bar, and a sten scale
 * reads naturally as a ruler with a "normal" middle zone, not a dial.
 */
function StenProgressBarComponent({ value, min, max, normativeFrom, normativeTo, className }: StenProgressBarProps) {
  const fillPct = position(value, min, max);
  const zoneLeftPct = position(normativeFrom, min, max);
  const zoneRightPct = position(normativeTo, min, max);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="relative h-3 w-full rounded-full bg-raised overflow-hidden">
        <div
          className="absolute inset-y-0 bg-success-subtle"
          style={{ left: `${zoneLeftPct}%`, width: `${zoneRightPct - zoneLeftPct}%` }}
        />
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${fillPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-mono-xs text-muted">
        <span>{min}</span>
        <span className="text-primary font-semibold">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export const StenProgressBar = memo(StenProgressBarComponent);
StenProgressBar.displayName = 'StenProgressBar';
