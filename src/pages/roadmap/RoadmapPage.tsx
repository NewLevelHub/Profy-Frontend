import { useRoadmap } from './hooks/useRoadmap';
import { ROADMAP_HORIZON_LABELS, ROADMAP_CATEGORY_EMOJIS } from '@/shared/config/constants';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { RoadmapHorizonKey, RoadmapMilestone } from '@/shared/types';

// ─── Horizon selector ──────────────────────────────────────────────────────────

function HorizonCard({
  milestone,
  onSelect,
}: {
  milestone: RoadmapMilestone;
  onSelect: (h: RoadmapHorizonKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(milestone.horizon)}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98] bg-[#F5F3FF] border-[1.5px] border-[#EDE9FE] hover:border-brand/40"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-black text-brand text-[13px]">
          {ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
        </span>
        <span className="font-semibold text-muted text-xs">
          {milestone.tasks.length} задач
        </span>
      </div>
      <p className="font-bold text-text text-[15px] leading-snug">
        {milestone.title}
      </p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {milestone.tasks.slice(0, 3).map((task, i) => (
          <span
            key={i}
            className="font-semibold text-[11px] text-brand bg-[#EDE9FE] rounded-pill px-2 py-0.5"
          >
            {ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•'}{' '}
            {task.text.length > 28 ? task.text.slice(0, 28) + '…' : task.text}
          </span>
        ))}
        {milestone.tasks.length > 3 && (
          <span className="font-semibold text-muted text-[11px] px-2 py-0.5">
            +{milestone.tasks.length - 3} ещё
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Active milestone view ──────────────────────────────────────────────────────

function MilestoneView({
  milestone,
  onBack,
}: {
  milestone: RoadmapMilestone;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 mb-4 font-bold text-brand text-sm"
      >
        <span className="text-lg leading-none">←</span>
        Все горизонты
      </button>

      <div className="mb-1">
        <span className="font-black text-brand text-xs uppercase tracking-widest">
          {ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
        </span>
      </div>
      <h2 className="font-black text-text mb-5 text-[22px] leading-tight">
        {milestone.title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {milestone.tasks
          .sort((a, b) => a.priority - b.priority)
          .map((task, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 bg-[#FAFAFA] border-[1.5px] border-[#F0F0F0]"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-white w-9 h-9 text-[15px] bg-gradient-to-br from-brand to-[#A78BFA]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-text text-[15px] leading-snug mb-1">
                    {task.text}
                  </p>
                  {task.description && (
                    <p className="text-muted font-medium text-[13px] leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <span className="inline-block mt-2 font-semibold text-[11px] text-brand bg-[#EDE9FE] rounded-pill px-2 py-0.5">
                    {ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•'} {task.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="font-black text-white rounded-2xl px-6 py-3 bg-brand text-[15px] disabled:opacity-60"
        >
          {actionLabel}
        </button>
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
    selectedHorizon,
    setSelectedHorizon,
    activeMilestone,
  } = useRoadmap();

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

  if (selectedHorizon && activeMilestone) {
    return (
      <PageContainer className="space-y-6">
        <MilestoneView
          milestone={activeMilestone}
          onBack={() => setSelectedHorizon(null)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Твой план развития"
        subtitle="Выбери горизонт — сколько у тебя есть времени"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {roadmap.milestones.map(milestone => (
          <HorizonCard
            key={milestone.horizon}
            milestone={milestone}
            onSelect={setSelectedHorizon}
          />
        ))}
      </div>
    </PageContainer>
  );
}
