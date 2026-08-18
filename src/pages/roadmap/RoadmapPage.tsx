import { useMemo, useState } from 'react';
import { useRoadmap } from './hooks/useRoadmap';
import {
  ROADMAP_HORIZON_LABELS,
  ROADMAP_CATEGORY_LABELS,
  ROADMAP_CATEGORY_EMOJIS,
} from '@/shared/config/constants';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { RoadmapFocusCard } from '@/shared/ui/roadmap/RoadmapFocusCard';
import { RoadmapStageCard } from '@/shared/ui/roadmap/RoadmapStageCard';
import { RoadmapStepItem } from '@/shared/ui/roadmap/RoadmapStepItem';
import { GeneratingOverlay } from '@/shared/ui/roadmap/GeneratingOverlay';
import { RecommendedPathsSection, pathBadgeStyle } from '@/shared/ui/roadmap/RecommendedPathsSection';
import { AdditionalResourcesSection } from '@/shared/ui/roadmap/AdditionalResourcesSection';
import type { RoadmapMilestone } from '@/shared/types';

function RoadmapEmptyState({
  icon,
  title,
  description,
  error,
  actionLabel,
  onAction,
  disabled,
}: {
  icon: string;
  title: string;
  description?: string;
  error?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  return (
    <PageContainer className="flex flex-col items-center py-16 gap-4 text-center">
      <div className="text-5xl">{icon}</div>
      <h2 className="font-black text-text text-xl">{title}</h2>
      {description && (
        <p className="text-muted font-medium text-sm max-w-md">{description}</p>
      )}
      {error && (
        <p className="text-red-500 font-semibold text-sm">{error}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="lg"
          onClick={onAction}
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      )}
    </PageContainer>
  );
}

function MilestonesTimeline({ milestones }: { milestones: RoadmapMilestone[] }) {
  return (
    <ol className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
      {milestones.map((milestone, i) => (
        <RoadmapStageCard
          key={milestone.horizon}
          horizonLabel={ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
          title={milestone.title}
          outcome={milestone.outcome}
          isLast={i === milestones.length - 1}
        >
          <ol className="flex flex-col gap-5">
            {[...milestone.tasks]
              .sort((a, b) => a.priority - b.priority)
              .map((task, taskIdx) => (
                <RoadmapStepItem
                  key={`${task.text}-${taskIdx}`}
                  index={taskIdx}
                  text={task.text}
                  description={task.description}
                  badges={[{
                    emoji: ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•',
                    label: ROADMAP_CATEGORY_LABELS[task.category] ?? task.category,
                    className: 'text-brand bg-brand-subtle',
                  }]}
                  resources={task.resources}
                  bulletClassName="bg-brand"
                />
              ))}
          </ol>
        </RoadmapStageCard>
      ))}
    </ol>
  );
}

export default function RoadmapPage() {
  const {
    roadmap,
    isLoading,
    error,
    notGenerated,
    isGenerating,
    generateError,
    generate,
  } = useRoadmap();

  const [activePathKey, setActivePathKey] = useState<string | null>(null);

  const hasMultiplePaths = (roadmap?.recommended_paths.length ?? 0) > 1;
  const activePath = useMemo(() => {
    if (!roadmap || !hasMultiplePaths) return null;
    return roadmap.recommended_paths.find(p => p.key === activePathKey) ?? roadmap.recommended_paths[0];
  }, [roadmap, hasMultiplePaths, activePathKey]);

  if (isGenerating) {
    return <GeneratingOverlay />;
  }

  if (isLoading) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="rounded-full animate-spin w-9 h-9 border-[3px] border-[#EDE9FE] border-t-brand" />
        <p className="font-semibold text-muted text-sm">Загружаем твой план...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <RoadmapEmptyState
        icon="⚠️"
        title={error}
        actionLabel="Попробовать снова"
        onAction={() => generate()}
      />
    );
  }

  if (notGenerated || !roadmap) {
    return (
      <RoadmapEmptyState
        icon="🗺️"
        title="Твой план ещё не составлен"
        description="Пройди диагностику, и мы составим персональный план развития по твоим результатам"
        error={generateError}
        actionLabel={isGenerating ? 'Составляем план...' : 'Составить план'}
        onAction={() => generate()}
        disabled={isGenerating}
      />
    );
  }

  const visibleMilestones = activePath ? activePath.milestones : roadmap.milestones;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Твой план развития"
        subtitle="Индивидуальные шаги, которые помогут тебе достичь поставленной цели."
      />

      <div className="flex flex-col gap-8">
        {roadmap.focus_summary && (
          <RoadmapFocusCard focusSummary={roadmap.focus_summary} />
        )}

        <RecommendedPathsSection paths={roadmap.recommended_paths} />

        <div>
          {hasMultiplePaths ? (
            <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Выбор направления плана">
              {roadmap.recommended_paths.map((path, i) => {
                const isActive = activePath?.key === path.key;
                return (
                  <button
                    key={path.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePathKey(path.key)}
                    className={cn(
                      'px-4 py-2 rounded-pill text-label font-bold border-[1.5px] transition-colors',
                      isActive
                        ? cn(pathBadgeStyle(i), 'border-transparent')
                        : 'text-secondary bg-surface border-default hover:border-strong',
                    )}
                  >
                    {path.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <SectionHeading title="Твой путь" className="mb-6" />
          )}

          <MilestonesTimeline milestones={visibleMilestones} />
        </div>

        <AdditionalResourcesSection resources={roadmap.additional_resources} />
      </div>
    </PageContainer>
  );
}
