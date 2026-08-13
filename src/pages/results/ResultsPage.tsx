import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { StudentCareer } from '@/shared/types';
import { useResults } from './hooks/useResults';
import { SummaryCard } from './components/SummaryCard';
import { StrengthCardsSection } from './components/StrengthCardsSection';
import { CareerCard } from './components/CareerCard';
import { InterestMapSection } from './components/InterestMapSection';
import { ThinkingStyleSection } from './components/ThinkingStyleSection';
import { MotivationSection } from './components/MotivationSection';
import { ExplorationActivitiesSection } from './components/ExplorationActivitiesSection';

function AnimatedBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
      {children}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </PageContainer>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();

  const {
    report,
    isLoading,
    error,
    hasCompletedAssessment,
    showUniversityBtn,
    isJunior,
    refetch,
  } = useResults();

  if (!hasCompletedAssessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">📋</span>
        <h2 className="text-h1 font-extrabold text-primary">Результатов пока нет</h2>
        <p className="text-body text-secondary max-w-xs">
          Сначала пройди диагностику, чтобы увидеть свои результаты
        </p>
        <Button onClick={() => navigate('/home')}>Перейти на главную</Button>
      </div>
    );
  }

  if (isLoading) return <ResultsSkeleton />;

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">Что-то пошло не так</h2>
        <p className="text-body text-secondary">{error ?? 'Не удалось загрузить результаты.'}</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    );
  }

  function handleCareerDetail(career: StudentCareer) {
    navigate(`/results/directions/${encodeURIComponent(career.slug)}`);
  }

  function handleUniversity(career: StudentCareer) {
    navigate(`/results/directions/${encodeURIComponent(career.slug)}/universities`);
  }

  return (
    <PageContainer className="flex flex-col gap-6">

      <PageHeader
        title="Что мы узнали о тебе"
        subtitle={isJunior ? 'Что тебе интересно и что стоит попробовать' : 'Твой RIASEC-профиль и рекомендованное направление'}
      />

      {/* Порядок разделов ниже — как в TZ_Profi.md §18.2 / result-report-
          redesign-plan.md "Флоу для нетехнического пользователя": резюме →
          сильные стороны → карта интересов → стиль мышления → мотивация →
          "что делать дальше" (профессии/занятия) — последним, не первым. */}

      <AnimatedBlock>
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} isFlatProfile={report.is_flat_profile} />
      </AnimatedBlock>

      <AnimatedBlock>
        <StrengthCardsSection cards={report.strength_cards} />
      </AnimatedBlock>

      <AnimatedBlock>
        <InterestMapSection items={report.interest_map} isJunior={isJunior} />
      </AnimatedBlock>

      <AnimatedBlock>
        <ThinkingStyleSection notes={report.thinking_style_notes} />
      </AnimatedBlock>

      <AnimatedBlock>
        <MotivationSection highlights={report.motivation_highlights} />
      </AnimatedBlock>

      {report.careers.length > 0 && (
        <AnimatedBlock>
          <section aria-label="Подходящие направления">
            <SectionHeading emoji="👥" title="Подходящие профессии" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {report.careers.map(career => (
                <CareerCard
                  key={career.slug}
                  career={career}
                  showUniversityBtn={showUniversityBtn}
                  onDetail={handleCareerDetail}
                  onUniversity={handleUniversity}
                />
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )}

      <AnimatedBlock>
        <ExplorationActivitiesSection activities={report.exploration_activities} note={report.exploration_note} />
      </AnimatedBlock>

    </PageContainer>
  );
}
