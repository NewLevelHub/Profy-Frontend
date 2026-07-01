import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Map } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { GapItem } from '@/shared/types';
import { localizeKey } from '@/pages/results/utils/programUtils';
import { useGapAnalysis } from '@/pages/results/hooks/useGapAnalysis';

// ── Readiness circle ──────────────────────────────────────────────────────────

function readinessLevel(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}

const READINESS_CAPTIONS: Record<string, string> = {
  success: 'Отличный результат — всё складывается в твою пользу!',
  warning: 'Хороший задел! Ещё немного работы — и всё получится.',
  danger: 'Пока есть что подтянуть — с правильным планом всё получится.',
};

function ReadinessCircle({ score }: { score: number }) {
  const level = readinessLevel(score);
  return (
    <div
      className={cn(
        'w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center bg-surface shadow-card',
        level === 'success' && 'border-success',
        level === 'warning' && 'border-warning',
        level === 'danger' && 'border-danger',
      )}
      role="img"
      aria-label={`Готовность ${Math.round(score)}%`}
    >
      <span
        className={cn(
          'text-3xl font-extrabold leading-none',
          level === 'success' && 'text-success',
          level === 'warning' && 'text-warning',
          level === 'danger' && 'text-danger',
        )}
      >
        {Math.round(score)}%
      </span>
      <span className="text-caption text-muted mt-1">готовность</span>
    </div>
  );
}

// ── Gap section ───────────────────────────────────────────────────────────────

interface GapSectionProps {
  title: string;
  icon: string;
  items: GapItem[];
  cardClassName: string;
  titleClassName: string;
}

const GapSection = memo(function GapSection({
  title,
  icon,
  items,
  cardClassName,
  titleClassName,
}: GapSectionProps) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className={cn('rounded-lg border p-4', cardClassName)}>
            <p className={cn('text-label font-semibold mb-1', titleClassName)}>
              {localizeKey(item.requirement)}
            </p>
            <p className="text-caption text-secondary">{item.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
});

// ── Skeleton ──────────────────────────────────────────────────────────────────

function GapAnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="flex justify-center py-4">
        <Skeleton className="w-36 h-36 rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GapAnalysisPage() {
  const navigate = useNavigate();
  const {
    result,
    isLoading,
    error,
    assessmentId,
    programName,
    universityName,
    handleBuildPlan,
    refetch,
  } = useGapAnalysis();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Nav */}
      <div className="mb-6">
        <button
          className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {isLoading ? (
        <>
          <p className="text-body text-secondary text-center mb-8">Анализируем твой профиль...</p>
          <GapAnalysisSkeleton />
        </>
      ) : !assessmentId ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl select-none" aria-hidden="true">🔒</span>
          <p className="text-label font-bold text-primary">Диагностика не пройдена</p>
          <p className="text-body text-secondary max-w-sm">
            Пройди диагностику, чтобы получить анализ готовности.
          </p>
          <Button onClick={() => navigate('/assessment/goal')}>Начать диагностику</Button>
        </div>
      ) : error !== null || !result ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error ?? 'Нет данных'}</p>
          <Button variant="ghost" onClick={() => refetch()}>Повторить</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          {programName && (
            <div>
              <h1 className="text-h1 font-extrabold text-primary mb-1">{programName}</h1>
              {universityName && (
                <p className="text-body text-secondary">{universityName}</p>
              )}
            </div>
          )}

          {/* Readiness circle */}
          <div className="flex flex-col items-center gap-3 py-4">
            <ReadinessCircle score={result.readiness_score} />
            <p className="text-body text-secondary text-center max-w-xs">
              {READINESS_CAPTIONS[readinessLevel(result.readiness_score)]}
            </p>
          </div>

          {/* Gap sections */}
          <GapSection
            title="Уже есть"
            icon="✓"
            items={result.met}
            cardClassName="bg-[#F0FDF4] border-[#86EFAC]"
            titleClassName="text-success"
          />
          <GapSection
            title="В процессе"
            icon="◌"
            items={result.in_progress}
            cardClassName="bg-[#FFFBEB] border-[#FCD34D]"
            titleClassName="text-warning"
          />
          <GapSection
            title="Нужно развить"
            icon="✗"
            items={result.not_met}
            cardClassName="bg-[#FEF2F2] border-[#FCA5A5]"
            titleClassName="text-danger"
          />
          {result.unknown.length > 0 && (
            <GapSection
              title="Нет данных"
              icon="?"
              items={result.unknown}
              cardClassName="bg-surface border-default"
              titleClassName="text-muted"
            />
          )}

          {/* CTA */}
          <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              className="w-full gap-2"
              onClick={handleBuildPlan}
            >
              <Map className="w-5 h-5" />
              Построить план подготовки
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
