import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

interface RoadmapStepBadge {
  emoji?: string;
  label: string;
  className?: string;
}

interface RoadmapStepResource {
  title: string;
  url?: string | null;
}

interface RoadmapStepItemProps {
  index: number;
  text: string;
  description?: string | null;
  badges: RoadmapStepBadge[];
  resources?: RoadmapStepResource[];
  bulletClassName?: string;
}

export const RoadmapStepItem = memo(function RoadmapStepItem({
  index,
  text,
  description,
  badges,
  resources = [],
  bulletClassName = 'bg-brand',
}: RoadmapStepItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          'text-caption font-bold text-on-brand',
          bulletClassName,
        )}
        aria-hidden="true"
      >
        {index + 1}
      </span>

      <div className="flex flex-col gap-2 min-w-0 pb-2">
        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={cn(
                  'px-2 py-0.5 rounded-pill text-caption font-semibold',
                  badge.className ?? 'text-secondary bg-surface border border-default',
                )}
              >
                {badge.emoji && <span className="mr-1">{badge.emoji}</span>}
                {badge.label}
              </span>
            ))}
          </div>
        )}

        <p className="text-body text-primary font-bold leading-snug">{text}</p>

        {description && (
          <p className="text-body text-secondary leading-relaxed">{description}</p>
        )}

        {resources.length > 0 && (
          <ul className="flex flex-col gap-1">
            {resources.map((resource, i) => (
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
