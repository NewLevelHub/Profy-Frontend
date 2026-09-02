import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { DIRECTION_HORIZON_LABELS } from '@/shared/config/constants';
import type { DirectionStage } from '@/shared/types';

interface HorizonCardProps {
  stage: DirectionStage;
  isFirst: boolean;
  isLast: boolean;
  /** Calendar year the final horizon targets — only meaningful on the last card. */
  targetYear: number;
}

/**
 * One cell of the 4-column horizon grid per spec 07: kicker + display title +
 * checklist. `RoadmapStep` carries no completion flag (verified against
 * `shared/types` — no per-step `completed`/`done` field exists anywhere in
 * the direction-roadmap API response), so every item renders the spec's
 * "not done" hairline-checkbox state honestly rather than inventing a
 * checked one. If/when the API adds per-step completion, add a `completed`
 * check here to switch a given item to the Pine-checkmark/strikethrough
 * treatment — do not fabricate it client-side in the meantime.
 */
export const HorizonCard = memo(function HorizonCard({
  stage, isFirst, isLast, targetYear,
}: HorizonCardProps) {
  const { t } = useTranslation();
  const horizonKey = DIRECTION_HORIZON_LABELS[stage.horizon];
  const horizonLabel = horizonKey ? t(horizonKey) : stage.horizon;
  const kicker = isFirst
    ? `${horizonLabel.toUpperCase()} · СЕЙЧАС`
    : isLast
      ? `К ЦЕЛИ · ${targetYear}`
      : horizonLabel.toUpperCase();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-5 bg-surface',
        'border-t lg:border-t-0',
        !isFirst && 'lg:border-l',
      )}
      style={{ borderColor: 'var(--hairline)' }}
    >
      <span
        className={cn(
          'font-mono text-mono-xs font-bold uppercase tracking-label',
          isFirst ? 'text-accent' : isLast ? 'text-brand' : 'text-muted',
        )}
      >
        {kicker}
      </span>

      <h3 className="font-sans font-semibold text-body-lg leading-snug text-primary">
        {stage.title}
      </h3>

      <ul className="flex flex-col gap-2 mt-1">
        {stage.steps.map((step, i) => (
          <li key={`${step.text}-${i}`} className="flex items-start gap-2.5">
            {/* Always the hollow/incomplete state today — see file header. */}
            <span
              className="mt-[3px] w-[15px] h-[15px] rounded-[3px] flex-shrink-0"
              style={{ border: '1.5px solid var(--hairline)' }}
              aria-hidden="true"
            />
            <span className="text-caption text-primary leading-relaxed">{step.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
