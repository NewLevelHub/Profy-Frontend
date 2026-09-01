import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, Target } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { useDevelopmentPlan } from './hooks/useDevelopmentPlan';
import { usePlanProgress } from './hooks/usePlanProgress';
import { DevelopmentPlanSkeleton } from './components/DevelopmentPlanSkeleton';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { AboutYouSection } from './components/AboutYouSection';
import { StageTimeline } from './components/StageTimeline';
import { AdmissionFactsCard } from './components/AdmissionFactsCard';
import { NearbyOpportunitiesSection } from './components/NearbyOpportunitiesSection';

type Plan = NonNullable<ReturnType<typeof useDevelopmentPlan>['plan']>;

function PlanHeader({ plan }: { plan: Plan }) {
  const { target, admission_facts: facts, is_foreign } = plan;
  const entTarget = !is_foreign && facts.min_ent_threshold
    ? `Главное — сдать ЕНТ примерно на ${facts.min_ent_threshold} баллов (порог на грант).`
    : is_foreign && facts.language_exam
      ? `Главное — сдать ${facts.language_exam} и подать документы вовремя.`
      : null;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Target className="h-5 w-5 text-brand shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-body-lg font-bold text-primary">
            Твой план: поступить в {target.university_name}
          </h1>
          <p className="text-body-sm text-secondary">
            {target.specialty} · будущая роль — {target.role}
          </p>
          {entTarget && <p className="text-body-sm font-medium text-primary">{entTarget}</p>}
          <p className="text-body-xs text-muted mt-1">{target.why}</p>
          {is_foreign && facts.foreign_route && (
            <p className="text-body-xs text-warning border-l-2 border-warning pl-2 mt-1">
              Путь поступления: {facts.foreign_route}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function PlanBody({ plan }: { plan: Plan }) {
  const progress = usePlanProgress(plan.id, plan.stages);
  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <PlanHeader plan={plan} />

      <Card className="flex items-center gap-3">
        <span className="text-body-sm font-semibold text-primary shrink-0">Прогресс</span>
        <ProgressBar value={progress.overallPct} className="flex-1" />
        <span className="text-mono-xs text-muted tabular-nums shrink-0">{progress.overallPct}%</span>
      </Card>

      <AboutYouSection aboutYou={plan.about_you} />
      <StageTimeline stages={plan.stages} progress={progress} />
      <AdmissionFactsCard facts={plan.admission_facts} />
      <NearbyOpportunitiesSection />
    </div>
  );
}

export default function DevelopmentPlanPage() {
  const navigate = useNavigate();
  const { plan, isLoading, isGenerating, notGenerated, errorKind, errorMessage, generate } =
    useDevelopmentPlan();

  return (
    <PageContainer className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      {isGenerating ? (
        <GeneratingOverlay />
      ) : isLoading ? (
        <DevelopmentPlanSkeleton />
      ) : errorKind ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl" aria-hidden>{errorKind === 'forbidden' ? '🔒' : '🤖'}</span>
          <p className="text-body text-primary max-w-sm">{errorMessage}</p>
          {errorKind === 'ai_unavailable' && (
            <Button size="lg" onClick={generate}>Попробовать снова</Button>
          )}
          {errorKind !== 'ai_unavailable' && (
            <Button variant="ghost" size="lg" onClick={() => navigate('/results')}>
              Назад к результатам
            </Button>
          )}
        </div>
      ) : notGenerated ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl" aria-hidden>🗺️</span>
          <PageHeader
            title="Плана пока нет"
            subtitle="Соберём план подготовки до поступления — сезон за сезоном, от пробного экзамена до подачи документов."
            align="center"
          />
          <Button size="lg" className="gap-2" onClick={generate}>
            <Sparkles className="w-5 h-5" /> Собрать план развития
          </Button>
        </div>
      ) : plan ? (
        <PlanBody plan={plan} />
      ) : null}
    </PageContainer>
  );
}
