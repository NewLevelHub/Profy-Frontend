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
import { RoadmapFocusCard } from '@/shared/ui/roadmap/RoadmapFocusCard';
import { RoadmapStageCard } from '@/shared/ui/roadmap/RoadmapStageCard';
import { RoadmapStepItem } from '@/shared/ui/roadmap/RoadmapStepItem';
import { GeneratingOverlay } from '@/shared/ui/roadmap/GeneratingOverlay';

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

        <div>
          <SectionHeading title="Твой путь" className="mb-6" />
          <ol className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
            {roadmap.milestones.map((milestone, i) => (
              <RoadmapStageCard
                key={milestone.horizon}
                horizonLabel={ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
                title={milestone.title}
                outcome={milestone.outcome}
                isLast={i === roadmap.milestones.length - 1}
              >
                <ol className="flex flex-col gap-5">
                  {[...milestone.tasks]
                    .sort((a, b) => a.priority - b.priority)
                    .map((task, taskIdx) => {
                      const badges = [
                        {
                          emoji: ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•',
                          label: ROADMAP_CATEGORY_LABELS[task.category] ?? task.category,
                          className: 'text-brand bg-brand-subtle',
                        },
                      ];
                      return (
                        <RoadmapStepItem
                          key={`${task.text}-${taskIdx}`}
                          index={taskIdx}
                          text={task.text}
                          description={task.description}
                          badges={badges}
                          bulletClassName="bg-brand"
                        />
                      );
                    })}
                </ol>
              </RoadmapStageCard>
            ))}
          </ol>
        </div>
      </div>
    </PageContainer>
  );
}
