import { useNavigate } from 'react-router';
import { GraduationCap, Map } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useResults } from './hooks/useResults';
import { ResultHero } from './components/ResultHero';
import { ResultChildProfile } from './components/ResultChildProfile';
import { ResultAxisHighlights } from './components/ResultAxisHighlights';
import { ResultBackups } from './components/ResultBackups';
import { ResultSkeleton } from './components/ResultSkeleton';
import { ResultEmptyState } from './components/ResultEmptyState';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { report, isLoading, isNotReady, error, hasCompletedAssessment, showUniversityBtn, refetch } = useResults();

  if (!hasCompletedAssessment || isNotReady) {
    return <ResultEmptyState onStart={() => navigate('/assessment/goal')} />;
  }

  if (isLoading) return <ResultSkeleton />;

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">Что-то пошло не так</h2>
        <p className="text-body text-secondary">{error ?? 'Не удалось загрузить результат.'}</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeader title="Твой результат" subtitle="Направление, которое подобрал тест" />

      <ResultHero
        directionName={report.direction_name}
        directionDescription={report.direction_description}
        message={report.message}
      />

      <ResultChildProfile strengths={report.strengths} growthAreas={report.growth_areas} />
      <ResultAxisHighlights axes={report.matched_axes} />
      <ResultBackups backups={report.backups} />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="gap-2"
          onClick={() =>
            navigate(`/results/directions/${encodeURIComponent(report.direction_slug)}/roadmap`, {
              state: { generate: true },
            })
          }
        >
          <Map className="w-5 h-5" />
          Составить план развития
        </Button>
        {showUniversityBtn && (
          <Button
            variant="ghost"
            size="lg"
            className="gap-2"
            onClick={() =>
              navigate(`/results/directions/${encodeURIComponent(report.direction_slug)}/universities`)
            }
          >
            <GraduationCap className="w-5 h-5" />
            Найти университеты
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
