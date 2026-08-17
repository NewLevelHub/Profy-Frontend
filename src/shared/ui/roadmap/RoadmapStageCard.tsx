import { memo } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';

interface RoadmapStageCardProps {
  horizonLabel: string;
  horizonHint?: string;
  title: string;
  outcome?: string | null;
  integrationProject?: string | null;
  isLast: boolean;
  children?: React.ReactNode;
}

export const RoadmapStageCard = memo(function RoadmapStageCard({
  horizonLabel,
  horizonHint,
  title,
  outcome,
  integrationProject,
  isLast,
  children,
}: RoadmapStageCardProps) {
  return (
    <li className="relative pl-6 sm:pl-8">
      {/* Timeline rail */}
      <span
        className="absolute left-[7px] top-3 w-2.5 h-2.5 rounded-full bg-brand"
        aria-hidden="true"
      />
      {!isLast && (
        <span
          className="absolute left-[11px] top-6 bottom-0 w-px bg-[var(--border)]"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col gap-4 pb-10">
        <header className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{horizonLabel}</Badge>
            {horizonHint && (
              <span className="text-caption text-muted">{horizonHint}</span>
            )}
          </div>
          <h3 className="text-title font-extrabold text-primary leading-snug">{title}</h3>
        </header>

        {outcome && (
          <div className="rounded-[var(--radius)] bg-raised border border-default p-4 flex items-start gap-3">
            <span className="text-lg select-none" aria-hidden="true">🏆</span>
            <div className="flex flex-col gap-1">
              <p className="text-caption font-semibold text-muted uppercase tracking-wide">
                Что у тебя будет к концу этапа
              </p>
              <p className="text-body text-primary leading-relaxed">{outcome}</p>
            </div>
          </div>
        )}

        {children}

        {integrationProject && (
          <div className="rounded-[var(--radius)] border border-strong bg-surface p-4 flex items-start gap-3 shadow-card">
            <span className="text-xl select-none" aria-hidden="true">🔗</span>
            <div className="flex flex-col gap-1">
              <p className="text-label font-bold text-primary">
                Проект, где всё сходится вместе
              </p>
              <p className="text-body text-secondary leading-relaxed">
                {integrationProject}
              </p>
            </div>
          </div>
        )}
      </div>
    </li>
  );
});
