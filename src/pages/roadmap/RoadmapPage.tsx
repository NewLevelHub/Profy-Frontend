import { useTranslation } from 'react-i18next';
import { useRoadmap } from './hooks/useRoadmap';
import { ROADMAP_HORIZON_LABELS, ROADMAP_CATEGORY_EMOJIS, ROADMAP_CATEGORY_LABELS } from '@/shared/config/constants';
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
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onSelect(milestone.horizon)}
      className="w-full text-left rounded-[var(--radius)] p-4 transition-all active:scale-[0.98] bg-surface border-[1.5px] border-default hover:border-brand/40"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-black text-brand text-caption">
          {ROADMAP_HORIZON_LABELS[milestone.horizon]
            ? t(ROADMAP_HORIZON_LABELS[milestone.horizon])
            : milestone.horizon}
        </span>
        <span className="font-semibold text-muted text-xs">
          {t('roadmap:page.taskCount', { count: milestone.tasks.length })}
        </span>
      </div>
      <p className="font-bold text-text text-body-sm leading-snug">
        {milestone.title}
      </p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {milestone.tasks.slice(0, 3).map((task, i) => (
          <span
            key={i}
            className="font-semibold text-mono-xs text-brand bg-brand-subtle rounded-pill px-2 py-0.5"
          >
            {ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•'}{' '}
            {task.text.length > 28 ? task.text.slice(0, 28) + '…' : task.text}
          </span>
        ))}
        {milestone.tasks.length > 3 && (
          <span className="font-semibold text-muted text-mono-xs px-2 py-0.5">
            {t('roadmap:page.moreCount', { count: milestone.tasks.length - 3 })}
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
  const { t } = useTranslation();
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 mb-4 font-bold text-brand text-sm"
      >
        <span className="text-lg leading-none">←</span>
        {t('roadmap:page.allHorizons')}
      </button>

      <div className="mb-1">
        <span className="font-black text-brand text-xs uppercase tracking-widest">
          {ROADMAP_HORIZON_LABELS[milestone.horizon]
            ? t(ROADMAP_HORIZON_LABELS[milestone.horizon])
            : milestone.horizon}
        </span>
      </div>
      <h2 className="font-black text-text mb-5 text-display-sm leading-tight">
        {milestone.title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {milestone.tasks
          .sort((a, b) => a.priority - b.priority)
          .map((task, i) => (
            <div
              key={i}
              className="rounded-[var(--radius)] p-4 bg-raised border-[1.5px] border-default"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-on-brand w-9 h-9 text-body-sm bg-brand">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-text text-body-sm leading-snug mb-1">
                    {task.text}
                  </p>
                  {task.description && (
                    <p className="text-muted font-medium text-caption leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <span className="inline-block mt-2 font-semibold text-mono-xs text-brand bg-brand-subtle rounded-pill px-2 py-0.5">
                    {ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•'}{' '}
                    {ROADMAP_CATEGORY_LABELS[task.category] ? t(ROADMAP_CATEGORY_LABELS[task.category]) : task.category}
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
        <p className="text-danger font-semibold text-sm">{error}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="font-black text-on-brand rounded-[var(--radius)] px-6 py-3 bg-brand text-body-sm disabled:opacity-60"
        >
          {actionLabel}
        </button>
      )}
    </PageContainer>
  );
}

export default function RoadmapPage() {
  const { t } = useTranslation();
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
        <div className="rounded-full animate-spin w-9 h-9 border-[3px] border-default border-t-brand" />
        <p className="font-semibold text-muted text-sm">{t('roadmap:page.loading')}</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <RoadmapEmptyState
        icon="⚠️"
        title={error}
        actionLabel={t('roadmap:action.retry')}
        onAction={() => generate()}
      />
    );
  }

  if (notGenerated || !roadmap) {
    return (
      <RoadmapEmptyState
        icon="🗺️"
        title={t('roadmap:empty.title')}
        description={t('roadmap:empty.body')}
        error={generateError}
        actionLabel={isGenerating ? t('roadmap:empty.generating') : t('roadmap:empty.cta')}
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
        title={t('roadmap:page.title')}
        subtitle={t('roadmap:page.subtitle')}
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
