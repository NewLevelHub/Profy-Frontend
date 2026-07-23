import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useDirectionRoadmap } from './hooks/useDirectionRoadmap';
import { DirectionRoadmapSkeleton } from './components/DirectionRoadmapSkeleton';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { GrowthFocusCard } from './components/GrowthFocusCard';
import { ProfessionsCard } from './components/ProfessionsCard';
import { RoadmapFeedbackCard } from './components/RoadmapFeedbackCard';
import { SkillsSection } from './components/SkillsSection';
import { StarterActionsSection } from './components/StarterActionsSection';
import { SubjectsNowSection } from './components/SubjectsNowSection';
import { UniversityRequirementsSection } from './components/UniversityRequirementsSection';

export default function DirectionRoadmapPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    roadmap, isLoading, isGenerating, notGenerated,
    errorKind, errorMessage, generate,
    submitFeedback, showFeedbackPrompt, feedbackPending,
  } = useDirectionRoadmap(slug);

  return (
    <PageContainer className="space-y-6">
      <button
        className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

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
            <Button variant="ghost" size="lg" onClick={() => navigate('/results')}>
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
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfessionsCard
              professions={roadmap.profession_options}
              directionName={roadmap.direction_name}
            />
            <GrowthFocusCard growthFocus={roadmap.growth_focus} />
          </div>

          <SubjectsNowSection subjects={roadmap.subjects_now} />
          <StarterActionsSection actions={roadmap.starter_actions} />
          <SkillsSection skills={roadmap.skills_to_build} />
          <UniversityRequirementsSection requirements={roadmap.university_requirements} />

          {showFeedbackPrompt && (
            <RoadmapFeedbackCard isPending={feedbackPending} onSubmit={submitFeedback} />
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-start">
            <Button
              variant="ghost"
              size="lg"
              className="sm:w-auto"
              onClick={() => navigate('/results')}
            >
              Назад к результатам
            </Button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
