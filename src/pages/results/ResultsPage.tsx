import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { StudentCareer } from '@/shared/types';
import { useResults } from './hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { AssessmentNotStartedCard } from './components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from './components/AssessmentInProgressCard';
import { SummaryCard } from './components/SummaryCard';
import { InterestDomainSection } from './components/InterestDomainSection';
import { StrengthsDomainSection } from './components/StrengthsDomainSection';
import { PersonalityDomainSection } from './components/PersonalityDomainSection';
import { ThinkingStyleMotivationSection } from './components/ThinkingStyleMotivationSection';
import { CareerCard } from './components/CareerCard';
import { ExplorationActivitiesSection } from './components/ExplorationActivitiesSection';
import { FinalAnalysisSection } from './components/FinalAnalysisSection';
import { GoalBranchSection } from './components/GoalBranchSection';
import { FeedbackSection } from './components/FeedbackSection';

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
      {Array.from({ length: 7 }, (_, i) => (
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
  const { t } = useTranslation('results');

  const {
    report,
    isLoading,
    isTranslating,
    error,
    hasCompletedAssessment,
    assessmentId,
    goal,
    ageGroup,
    isJunior,
    refetch,
    inProgress,
    answeredCount,
    totalQuestions,
  } = useResults();

  if (!hasCompletedAssessment) {
    return (
      <PageContainer>
        {inProgress ? (
          <AssessmentInProgressCard
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            onContinue={() => navigate('/assessment')}
          />
        ) : (
          <AssessmentNotStartedCard onStart={() => navigate('/assessment/goal')} />
        )}
      </PageContainer>
    );
  }

  if (isLoading) return <ResultsSkeleton />;

  // Language was switched on a finished report — the backend is translating
  // the existing narrative (see useResults `isTranslating`). Show the same
  // mascot "preparing your result" screen as a first-time generation rather
  // than holding the report on screen in the previous language.
  if (isTranslating) {
    return (
      <PageContainer>
        <ResultLoadingView className="min-h-[70vh]" />
      </PageContainer>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">{t('error.somethingWrong')}</h2>
        <p className="text-body text-secondary">{error ?? t('error.loadResults')}</p>
        <Button onClick={() => refetch()}>{t('common:retry')}</Button>
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">

      {/* Same-tab navigate, deliberately not a new tab (tried that — Safari
          treats `window.print()` from a script-opened tab as its own
          ephemeral "print preview" surface, and the underlying content tab
          can end up blank once the dialog closes, occasionally clipping the
          save itself). Standard single-tab print flow instead: the dialog
          layers over this same tab, and "К результатам" on the printable
          view navigates back here when done. `?auto=1` opens the print
          dialog itself as soon as the printable view has its fonts, so this
          stays one click. */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title={t('page.title')}
          subtitle={isJunior ? t('page.subtitleJunior') : t('page.subtitleAdult')}
        />
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={() => navigate('/results/print?auto=1')}
        >
          <Download size={16} aria-hidden="true" />
          {t('page.downloadPdf')}
        </Button>
      </div>

      {/* Порядок разделов ниже — как в TZ_Profi.md §18.2 / result-report-
          redesign-plan.md "Флоу для нетехнического пользователя": резюме →
          общая диагностика, теперь как отдельно озаглавленные домены, все в
          одной визуальной системе (DomainCardParts) — карьерные интересы/
          ведущие способности → сильные стороны → личностный профиль →
          стиль мышления и мотивация (один card) → "что делать дальше"
          (профессии/занятия) — последним, не первым. */}

      <AnimatedBlock>
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} />
      </AnimatedBlock>

      <AnimatedBlock>
        <InterestDomainSection
          isJunior={isJunior}
          interestMap={report.interest_map}
          interestMapNote={report.interest_map_note}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <StrengthsDomainSection strengthCards={report.strength_cards} />
      </AnimatedBlock>

      <AnimatedBlock>
        <PersonalityDomainSection
          personalityNotes={report.personality_notes}
          personalityNote={report.personality_note}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <ThinkingStyleMotivationSection
          thinkingStyleNotes={report.thinking_style_notes}
          motivationHighlights={report.motivation_highlights}
        />
      </AnimatedBlock>

      {/* {report.careers.length > 0 && (
        <AnimatedBlock>
          <section aria-label="Подходящие направления">
            <SectionHeading emoji="👥" title="Подходящие профессии" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {report.careers.map(career => (
                <CareerCard
                  key={career.slug}
                  career={career}
                  showUniversityBtn={showUniversityBtn}
                />
              ))}
            </div>
          </section>
        </AnimatedBlock>
      )} */}

      <AnimatedBlock>
        <ExplorationActivitiesSection activities={report.exploration_activities} note={report.exploration_note} />
      </AnimatedBlock>

      <AnimatedBlock>
        <FinalAnalysisSection text={report.final_analysis} />
      </AnimatedBlock>

      {/* ── Update boundary ──────────────────────────────────────────────
          Everything above is the shared diagnostic block — identical
          regardless of goal, and never re-rendered by the goal switcher
          below (GoalBranchSection owns its own local state; nothing above
          this line reads it). See GoalBranchSection.tsx. */}
      <AnimatedBlock>
        <GoalBranchSection report={report} ageGroup={ageGroup} initialGoal={goal} />
      </AnimatedBlock>

      <AnimatedBlock>
        <FeedbackSection assessmentId={assessmentId} />
      </AnimatedBlock>

    </PageContainer>
  );
}
