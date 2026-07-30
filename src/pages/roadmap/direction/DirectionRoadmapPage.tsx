import { useNavigate, useParams } from 'react-router';
import { Sparkles } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import type { SlugParams } from '@/app/routes';
import { BackButton } from '@/shared/ui/BackButton';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useDirectionRoadmap } from './hooks/useDirectionRoadmap';
import { DirectionRoadmapSkeleton } from './components/DirectionRoadmapSkeleton';
import { EntReadinessSection } from './components/EntReadinessSection';
// import { FeedbackSurveyModal } from './components/FeedbackSurveyModal';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { GrowthFocusCard } from './components/GrowthFocusCard';
import { ProfessionsCard } from './components/ProfessionsCard';
import { RoadmapUniversitiesCta } from './components/RoadmapUniversitiesCta';
import { SkillsSection } from './components/SkillsSection';
import { StarterActionsSection } from './components/StarterActionsSection';
import { roadmapType } from './roadmapTypography';

export default function DirectionRoadmapPage() {
  const { slug = '' } = useParams<SlugParams>();
  const navigate = useNavigate();
  const {
    roadmap, isLoading, isGenerating, notGenerated,
    errorKind, errorMessage, generate,
    // submitFeedback, feedbackPending,
    // feedbackSentinelRef, isFeedbackModalOpen, closeFeedbackModal,
    subjectScores,
  } = useDirectionRoadmap(slug);

  return (
    <PageContainer className="space-y-6">
      {isGenerating ? (
        <GeneratingOverlay />
      ) : isLoading ? (
        <DirectionRoadmapSkeleton />
      ) : errorKind ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl select-none" aria-hidden="true">
            {errorKind === 'ai_unavailable' ? '🤖' : '🔒'}
          </span>
          <p className="text-body text-primary max-w-sm">{errorMessage}</p>

          {errorKind === 'ai_unavailable' && (
            <Button variant="primary" size="lg" onClick={generate}>
              Попробовать снова
            </Button>
          )}
          {(errorKind === 'wrong_direction' || errorKind === 'forbidden' || errorKind === 'generic') && (
            <Button variant="ghost" size="lg" onClick={() => navigate(ROUTES.results)}>
              Назад к результатам
            </Button>
          )}
        </div>
      ) : notGenerated ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl select-none" aria-hidden="true">🗺️</span>
          <PageHeader
            title="Плана пока нет"
            subtitle="Составим персональный план развития в этом направлении — от того, что ты можешь делать уже сейчас, до конечной цели."
            align="center"
          />
          <Button variant="primary" size="lg" className="gap-2" onClick={generate}>
            <Sparkles className="w-5 h-5" />
            Построить мой план
          </Button>
        </div>
      ) : roadmap ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3.5 flex-wrap">
            <BackButton />
            <h1 className={roadmapType.pageTitle}>План развития</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ProfessionsCard
              professions={roadmap.profession_options}
              directionName={roadmap.direction_name}
            />
            <GrowthFocusCard growthFocus={roadmap.growth_focus} />
          </div>

          <StarterActionsSection actions={roadmap.starter_actions} />
          <EntReadinessSection
            subjects={roadmap.subjects_now}
            subjectScores={subjectScores}
          />
          <SkillsSection skills={roadmap.skills_to_build} />
          <RoadmapUniversitiesCta
            directionSlug={roadmap.direction_slug}
            onNavigate={path => navigate(path)}
          />

          {/* Feedback modal sentinel — disabled for now
          <div ref={feedbackSentinelRef} />
          */}
        </div>
      ) : null}

      {/* Feedback modal — disabled for now
      <FeedbackSurveyModal
        isOpen={isFeedbackModalOpen}
        isPending={feedbackPending}
        onClose={closeFeedbackModal}
        onSubmit={submitFeedback}
      />
      */}
    </PageContainer>
  );
}
