import { memo } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  DIRECTION_CATEGORY_EMOJIS,
  DIRECTION_CATEGORY_LABELS,
  STEP_TRACK_LABELS,
} from '@/shared/config/constants';
import type { RoadmapStep, StepTrack } from '@/shared/types';

interface StepItemProps {
  step: RoadmapStep;
  index: number;
}

const TRACK_STYLES: Record<StepTrack, { badge: string; bullet: string; emoji: string }> = {
  profile: { badge: 'bg-brand-subtle text-brand', bullet: 'bg-brand', emoji: '🎯' },
  growth: { badge: 'bg-accent-soft text-accent', bullet: 'bg-accent', emoji: '🌱' },
  integration: { badge: 'bg-raised text-secondary', bullet: 'bg-strong', emoji: '🔗' },
};

export const StepItem = memo(function StepItem({ step, index }: StepItemProps) {
  const style = TRACK_STYLES[step.track] ?? TRACK_STYLES.profile;

  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          'text-caption font-bold text-on-brand',
          style.bullet,
        )}
        aria-hidden="true"
      >
        {index + 1}
      </span>

      <div className="flex flex-col gap-2 min-w-0 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded-pill text-caption font-semibold',
              style.badge,
            )}
          >
            {style.emoji} {STEP_TRACK_LABELS[step.track] ?? step.track}
          </span>
          <span className="px-2 py-0.5 rounded-pill text-caption text-secondary bg-surface border border-default">
            {DIRECTION_CATEGORY_EMOJIS[step.category] ?? '•'}{' '}
            {DIRECTION_CATEGORY_LABELS[step.category] ?? step.category}
          </span>
        </div>

        <p className="text-body text-primary font-bold leading-snug">{step.text}</p>

        {step.description && (
          <p className="text-body text-secondary leading-relaxed">{step.description}</p>
        )}

        {/* Content catalogue is not live yet — the API always returns an empty list. */}
        {step.resources.length > 0 && (
          <ul className="flex flex-col gap-1">
            {step.resources.map((resource, i) => (
              <li key={i} className="text-caption text-secondary">
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:underline"
                  >
                    {resource.title}
                  </a>
                ) : (
                  resource.title
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
});
