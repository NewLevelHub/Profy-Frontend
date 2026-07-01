import { useRoadmap } from './hooks/useRoadmap';
import { ROADMAP_HORIZON_LABELS, ROADMAP_CATEGORY_EMOJIS } from '@/shared/config/constants';
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
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        background: '#F5F3FF',
        border: '1.5px solid #EDE9FE',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-black text-brand"
          style={{ fontSize: 13 }}
        >
          {ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
        </span>
        <span
          className="font-semibold text-muted"
          style={{ fontSize: 12 }}
        >
          {milestone.tasks.length} задач
        </span>
      </div>
      <p className="font-bold text-text" style={{ fontSize: 15, lineHeight: 1.35 }}>
        {milestone.title}
      </p>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {milestone.tasks.slice(0, 3).map((task, i) => (
          <span
            key={i}
            className="font-semibold"
            style={{
              fontSize: 11,
              color: '#7C3AED',
              background: '#EDE9FE',
              borderRadius: 20,
              padding: '2px 8px',
            }}
          >
            {ROADMAP_CATEGORY_EMOJIS[task.category] ?? '•'} {task.text.length > 28 ? task.text.slice(0, 28) + '…' : task.text}
          </span>
        ))}
        {milestone.tasks.length > 3 && (
          <span
            className="font-semibold text-muted"
            style={{ fontSize: 11, padding: '2px 8px' }}
          >
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
        className="flex items-center gap-1.5 mb-4 font-bold text-brand"
        style={{ fontSize: 14 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
        Все горизонты
      </button>

      <div className="mb-1">
        <span
          className="font-black text-brand"
          style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {ROADMAP_HORIZON_LABELS[milestone.horizon] ?? milestone.horizon}
        </span>
      </div>
      <h2 className="font-black text-text mb-5" style={{ fontSize: 22, lineHeight: 1.2 }}>
        {milestone.title}
      </h2>

      <div className="flex flex-col gap-3">
        {milestone.tasks
          .sort((a, b) => a.priority - b.priority)
          .map((task, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{ background: '#FAFAFA', border: '1.5px solid #F0F0F0' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-white"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                    fontSize: 15,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-text" style={{ fontSize: 15, lineHeight: 1.3 }}>
                      {task.text}
                    </p>
                  </div>
                  {task.description && (
                    <p
                      className="text-muted font-medium"
                      style={{ fontSize: 13, lineHeight: 1.5 }}
                    >
                      {task.description}
                    </p>
                  )}
                  <span
                    className="inline-block mt-2 font-semibold"
                    style={{
                      fontSize: 11,
                      color: '#7C3AED',
                      background: '#EDE9FE',
                      borderRadius: 20,
                      padding: '2px 8px',
                    }}
                  >
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="rounded-full animate-spin"
          style={{ width: 36, height: 36, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED' }}
        />
        <p className="font-semibold text-muted" style={{ fontSize: 14 }}>
          Загружаем твой план...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="font-bold text-text text-center" style={{ fontSize: 16 }}>{error}</p>
        <button
          type="button"
          onClick={() => generate()}
          className="font-black text-white rounded-2xl px-6 py-3"
          style={{ background: '#7C3AED', fontSize: 15 }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (notGenerated || !roadmap) {
    return (
      <div className="flex flex-col items-center py-16 gap-4 px-4">
        <div style={{ fontSize: 48 }}>🗺️</div>
        <h2 className="font-black text-text text-center" style={{ fontSize: 20 }}>
          Твой план ещё не составлен
        </h2>
        <p className="text-muted font-medium text-center" style={{ fontSize: 14, maxWidth: 280 }}>
          Пройди диагностику, и мы составим персональный план развития по твоим результатам
        </p>
        {generateError && (
          <p className="text-red-500 font-semibold text-center" style={{ fontSize: 13 }}>
            {generateError}
          </p>
        )}
        <button
          type="button"
          onClick={() => generate()}
          disabled={isGenerating}
          className="font-black text-white rounded-2xl px-6 py-3 disabled:opacity-60"
          style={{ background: '#7C3AED', fontSize: 15 }}
        >
          {isGenerating ? 'Составляем план...' : 'Составить план'}
        </button>
      </div>
    );
  }

  // Active milestone detail view
  if (selectedHorizon && activeMilestone) {
    return (
      <div className="px-4 pt-4 pb-8">
        <MilestoneView
          milestone={activeMilestone}
          onBack={() => setSelectedHorizon(null)}
        />
      </div>
    );
  }

  // Horizon selection view
  return (
    <div className="px-4 pt-4 pb-8">
      <h1 className="font-black text-text mb-1" style={{ fontSize: 24, lineHeight: 1.2 }}>
        Твой план развития
      </h1>
      <p className="text-muted font-medium mb-6" style={{ fontSize: 14 }}>
        Выбери горизонт — сколько у тебя есть времени
      </p>

      <div className="flex flex-col gap-3">
        {roadmap.milestones.map(milestone => (
          <HorizonCard
            key={milestone.horizon}
            milestone={milestone}
            onSelect={setSelectedHorizon}
          />
        ))}
      </div>
    </div>
  );
}
