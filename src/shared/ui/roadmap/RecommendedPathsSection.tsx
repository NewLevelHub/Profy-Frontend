import { memo } from 'react';
import { Card } from '@/shared/ui/Card';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { cn } from '@/shared/lib/cn';
import type { RecommendedPath } from '@/shared/types';

// Cycled by index, not looked up by key — key is a free-form id ("A"/"B"),
// only the position (1st vs 2nd path) needs a distinct, stable color.
const PATH_STYLES = [
  { badge: 'text-brand bg-brand-subtle', emoji: '🅰️' },
  { badge: 'text-accent bg-accent-soft', emoji: '🅱️' },
];

export function pathBadgeStyle(index: number): string {
  return PATH_STYLES[index % PATH_STYLES.length].badge;
}

interface RecommendedPathsSectionProps {
  paths: RecommendedPath[];
}

export const RecommendedPathsSection = memo(function RecommendedPathsSection({
  paths,
}: RecommendedPathsSectionProps) {
  if (paths.length === 0) return null;

  return (
    <div>
      <SectionHeading
        title={paths.length > 1 ? 'Какие направления мы предлагаем' : 'Какое направление мы предлагаем'}
        className="mb-4"
      />
      {paths.length > 1 && (
        <p className="text-caption text-secondary mb-4">
          Ниже — {paths.length} направления, которые лучше всего откликнулись по тесту. Можно развивать
          и то, и другое параллельно, а можно выбрать одно — задачи в плане ниже помечены, к какому
          направлению они относятся.
        </p>
      )}
      <div className={cn('grid gap-4', paths.length > 1 && 'sm:grid-cols-2')}>
        {paths.map((path, i) => (
          <Card key={path.key} className="flex flex-col gap-3">
            <span
              className={cn('self-start px-2.5 py-1 rounded-pill text-caption font-bold', pathBadgeStyle(i))}
            >
              {PATH_STYLES[i % PATH_STYLES.length].emoji} {path.label}
            </span>
            <p className="text-body text-secondary leading-relaxed">{path.why}</p>
            <div className="rounded-[var(--radius)] bg-raised border border-default p-3 flex items-start gap-2">
              <span className="text-base select-none" aria-hidden="true">🔭</span>
              <p className="text-caption text-secondary leading-relaxed">{path.future_benefit}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});
