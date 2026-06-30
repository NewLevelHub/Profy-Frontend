import { memo } from 'react';
import { useNavigate } from 'react-router';
import { Map } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { RoadmapHorizonKey, RoadmapMilestone, RoadmapTask, RoadmapTaskCategory } from '@/shared/types';
import { useRoadmap } from './hooks/useRoadmap';

// ── Constants ─────────────────────────────────────────────────────────────────

const HORIZON_LABELS: Record<RoadmapHorizonKey, string> = {
  month_1: '1 месяц',
  months_3: '3 месяца',
  months_6: '6 месяцев',
  year_1: '1 год',
  until_goal: 'До цели',
};

const CATEGORY_META: Record<RoadmapTaskCategory, { emoji: string; label: string }> = {
  study: { emoji: '📚', label: 'Учёба' },
  language: { emoji: '🌐', label: 'Язык' },
  project: { emoji: '💻', label: 'Проект' },
  exam: { emoji: '📝', label: 'Экзамен' },
  explore: { emoji: '🔍', label: 'Исследование' },
  achievement: { emoji: '🏆', label: 'Достижение' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TaskCard = memo(function TaskCard({ task }: { task: RoadmapTask }) {
  const meta = CATEGORY_META[task.category] ?? { emoji: '⭐', label: task.category };
  return (
    <Card className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-caption text-secondary font-semibold">
        <span aria-hidden="true">{meta.emoji}</span>
        {meta.label}
      </span>
      <p className="text-body text-primary leading-relaxed">{task.text}</p>
    </Card>
  );
});

function MilestoneSection({ milestone }: { milestone: RoadmapMilestone }) {
  const label = HORIZON_LABELS[milestone.horizon] ?? milestone.horizon;
  return (
    <section aria-label={label}>
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-pill text-caption font-extrabold bg-brand text-on-brand flex-shrink-0">
          {label}
        </span>
        <h2 className="text-subtitle font-bold text-primary">{milestone.title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {milestone.tasks.map((task, i) => (
          <TaskCard key={i} task={task} />
        ))}
      </div>
    </section>
  );
}

function RoadmapSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-20 rounded-pill" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const navigate = useNavigate();
  const {
    roadmap,
    isLoading,
    error,
    notGenerated,
    isGenerating,
    generateError,
    generate,
    refetch,
    hasCompletedAssessment,
  } = useRoadmap();

  if (!hasCompletedAssessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">📘</span>
        <h2 className="text-h1 font-extrabold text-primary">Диагностика не пройдена</h2>
        <p className="text-body text-secondary max-w-xs">
          Пройди диагностику — и мы составим твой персональный план развития
        </p>
        <Button onClick={() => navigate('/assessment/goal')}>Начать диагностику</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <RoadmapSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">Что-то пошло не так</h2>
        <p className="text-body text-secondary">{error}</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    );
  }

  if (notGenerated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🗺️</span>
        <h2 className="text-h1 font-extrabold text-primary">Роадмап ещё не составлен</h2>
        <p className="text-body text-secondary max-w-xs">
          Мы создадим персональный план по горизонтам — с конкретными задачами для каждого этапа
        </p>
        {generateError && (
          <p className="text-caption text-danger">{generateError}</p>
        )}
        <Button
          size="lg"
          isLoading={isGenerating}
          disabled={isGenerating}
          onClick={() => generate()}
          className="gap-2"
        >
          <Map className="w-5 h-5" />
          Составить план
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <div>
        <h1 className="text-h1 font-extrabold text-primary mb-1">Мой план развития</h1>
        <p className="text-body text-secondary">Персональный путь к твоей цели</p>
      </div>

      {generateError && (
        <div className="p-3 rounded-xl bg-danger-subtle text-danger text-caption text-center">
          {generateError}
        </div>
      )}

      {roadmap?.milestones.map((milestone, i) => (
        <MilestoneSection key={i} milestone={milestone} />
      ))}

      <div className="pt-2 pb-4">
        <Button
          variant="ghost"
          size="sm"
          isLoading={isGenerating}
          disabled={isGenerating}
          onClick={() => generate()}
          className="w-full gap-2"
        >
          <Map className="w-4 h-4" />
          Обновить план
        </Button>
      </div>
    </div>
  );
}
