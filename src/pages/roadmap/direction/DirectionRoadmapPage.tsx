import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { useDirectionRoadmap } from './hooks/useDirectionRoadmap';
import { DirectionRoadmapSkeleton } from './components/DirectionRoadmapSkeleton';
import { GeneratingOverlay } from '@/shared/ui/roadmap/GeneratingOverlay';
import { GrowthFocusCard } from './components/GrowthFocusCard';
import { SkillsSection } from './components/SkillsSection';
import { TargetCard } from './components/TargetCard';
import { UniversityRequirementsCard } from './components/UniversityRequirementsCard';
import { UniversityTrackSection } from './components/UniversityTrackSection';
import { RoadmapStageCard } from '@/shared/ui/roadmap/RoadmapStageCard';
import { RoadmapStepItem } from '@/shared/ui/roadmap/RoadmapStepItem';
import {
  DIRECTION_HORIZON_HINTS,
  DIRECTION_HORIZON_LABELS,
  DIRECTION_CATEGORY_EMOJIS,
  DIRECTION_CATEGORY_LABELS,
  STEP_TRACK_LABELS,
} from '@/shared/config/constants';
import type { StepTrack } from '@/shared/types';

const TRACK_STYLES: Record<StepTrack, { badge: string; bullet: string; emoji: string }> = {
  profile: { badge: 'bg-brand-subtle text-brand', bullet: 'bg-brand', emoji: '🎯' },
  growth: { badge: 'bg-accent-soft text-accent', bullet: 'bg-accent', emoji: '🌱' },
  integration: { badge: 'bg-raised text-secondary', bullet: 'bg-strong', emoji: '🔗' },
};

export default function DirectionRoadmapPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    roadmap, isLoading, isGenerating, notGenerated,
    errorKind, errorMessage, generate,
  } = useDirectionRoadmap(slug);

  const inquiryPath = `/results/directions/${encodeURIComponent(slug)}/inquiry`;

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
          {errorKind === 'needs_inquiry' && (
            <Button variant="primary" size="lg" onClick={() => navigate(inquiryPath)}>
              Пройти опрос
            </Button>
          )}
          {(errorKind === 'forbidden' || errorKind === 'generic') && (
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
            <TargetCard target={roadmap.target} directionName={roadmap.direction_name} />
            <GrowthFocusCard growthFocus={roadmap.growth_focus} />
          </div>

          <div>
            <SectionHeading title="Твой путь на год" className="mb-1" />
            <p className="text-body text-secondary mb-6">
              Каждый месяц — шаги в профиль и в твою точку роста.
            </p>
            <ol className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
              {roadmap.stages.map((stage, i) => (
                <RoadmapStageCard
                  key={stage.horizon}
                  horizonLabel={DIRECTION_HORIZON_LABELS[stage.horizon] ?? stage.horizon}
                  horizonHint={DIRECTION_HORIZON_HINTS[stage.horizon]}
                  title={stage.title}
                  outcome={stage.outcome}
                  integrationProject={stage.integration_project}
                  isLast={i === roadmap.stages.length - 1}
                >
                  <ol className="flex flex-col gap-5">
                    {[...stage.steps]
                      .sort((a, b) => a.priority - b.priority)
                      .map((step, stepIdx) => {
                        const style = TRACK_STYLES[step.track] ?? TRACK_STYLES.profile;
                        const badges = [
                          {
                            emoji: style.emoji,
                            label: STEP_TRACK_LABELS[step.track] ?? step.track,
                            className: style.badge,
                          },
                          {
                            emoji: DIRECTION_CATEGORY_EMOJIS[step.category] ?? '•',
                            label: DIRECTION_CATEGORY_LABELS[step.category] ?? step.category,
                          },
                        ];
                        return (
                          <RoadmapStepItem
                            key={`${step.text}-${stepIdx}`}
                            index={stepIdx}
                            text={step.text}
                            description={step.description}
                            badges={badges}
                            resources={step.resources}
                            bulletClassName={style.bullet}
                          />
                        );
                      })}
                  </ol>
                </RoadmapStageCard>
              ))}
            </ol>
          </div>

          <SkillsSection
            skills={roadmap.skills_to_build}
            subjects={roadmap.subjects_to_focus}
          />
          <UniversityRequirementsCard requirements={roadmap.university_requirements} />
          <UniversityTrackSection track={roadmap.university_track} />

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
