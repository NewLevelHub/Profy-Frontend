import { useNavigate } from 'react-router';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { useResults } from './hooks/useResults';
import { ResultHero } from './components/ResultHero';
import { ResultProfessionExamples } from './components/ResultProfessionExamples';
import { ResultAxisComparison } from './components/ResultAxisComparison';
import { ResultBackups } from './components/ResultBackups';
import { ResultProgramRecommendations } from './components/ResultProgramRecommendations';
import { ResultSkeleton } from './components/ResultSkeleton';
import { ResultEmptyState } from './components/ResultEmptyState';

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    report, isLoading, isNotReady, error, hasCompletedAssessment,
    showUniversityBtn, showUniversityRecommendations, subjectReadiness, refetch,
  } = useResults();

  if (!hasCompletedAssessment || isNotReady) {
    return (
      <ResultEmptyState onStart={() => navigate('/assessment/goal')} onHome={() => navigate('/home')} />
    );
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
      <div className="flex items-center gap-3.5 flex-wrap">
        <h1 className="font-black text-primary tracking-[-0.02em] text-[30px] leading-tight m-0">
          Твой результат
        </h1>
        <Badge variant="success">Тест пройден</Badge>
      </div>

      <ResultHero
        directionSlug={report.direction_slug}
        directionName={report.direction_name}
        directionDescription={report.direction_description}
        matchPercent={report.match_percent}
      />

      <ResultProfessionExamples professions={report.professions} />

      <ResultAxisComparison
        matches={report.matches}
        growthAreas={report.growth_areas}
        isDirectionSpecific={report.is_direction_specific}
        subjectScores={subjectReadiness?.subject_scores}
      />
      <ResultBackups backups={report.backups} />
      {showUniversityRecommendations && (
        <ResultProgramRecommendations
          programs={report.recommended_programs}
          directionSlug={report.direction_slug}
        />
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <Button
          size="lg"
          className="gap-2"
          onClick={() =>
            navigate(`/results/directions/${encodeURIComponent(report.direction_slug)}/roadmap`, {
              state: { generate: true },
            })
          }
        >
          🗺️ Составить план развития
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
            🎓 Найти университеты
          </Button>
        )}
        <Button
          variant="ghost"
          size="lg"
          className="gap-2"
          onClick={() =>
            navigate(`/results/directions/${encodeURIComponent(report.direction_slug)}/feedback`)
          }
        >
          💬 Оценить результат
        </Button>
      </div>
    </PageContainer>
  );
}
