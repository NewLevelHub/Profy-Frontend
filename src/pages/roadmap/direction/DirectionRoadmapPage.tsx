import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { useProfileStore } from '@/shared/store/profile';
import { useBackTo } from '@/shared/lib/useBackTo';
import { DIRECTION_HORIZON_LABELS } from '@/shared/config/constants';
import { useDirectionRoadmap } from './hooks/useDirectionRoadmap';
import { DirectionRoadmapSkeleton } from './components/DirectionRoadmapSkeleton';
import { DirectionVerdictCard } from './components/DirectionVerdictCard';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { GrowthFocusCard } from './components/GrowthFocusCard';
import { HorizonCard } from './components/HorizonCard';
import { RoadmapHeaderCard } from './components/RoadmapHeaderCard';
import { SkillsSection } from './components/SkillsSection';
import { SubjectsGapSection } from './components/SubjectsGapSection';
import { TargetCard } from './components/TargetCard';
import { UniversityTrackSection } from './components/UniversityTrackSection';

export default function DirectionRoadmapPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    roadmap, isLoading, isGenerating, notGenerated,
    errorKind, errorMessage, generate,
  } = useDirectionRoadmap(slug);
  const subjectsEasy = useProfileStore(s => s.profile?.subjects_easy ?? []);

  const inquiryPath = `/results/directions/${encodeURIComponent(slug)}/inquiry`;
  const goBack = useBackTo(`/results/directions/${encodeURIComponent(slug)}`);
  // "ЦЕЛЬ: ПОСТУПЛЕНИЕ {year}" — derived from the real `target.horizon_years`
  // the plan was generated with, not a hardcoded or guessed admission date.
  const targetYear = roadmap
    ? new Date().getFullYear() + roadmap.target.horizon_years
    : new Date().getFullYear();

  return (
    <PageContainer className="space-y-6">
      <button
        className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity mb-6"
        onClick={goBack}
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common:back')}
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
              {t('roadmap:action.retry')}
            </Button>
          )}
          {errorKind === 'needs_inquiry' && (
            <Button variant="primary" size="lg" onClick={() => navigate(inquiryPath)}>
              {t('roadmap:direction.takeInquiry')}
            </Button>
          )}
          {(errorKind === 'forbidden' || errorKind === 'generic') && (
            <Button variant="ghost" size="lg" onClick={() => navigate('/results')}>
              {t('common:backToResults')}
            </Button>
          )}
        </div>
      ) : notGenerated ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl select-none" aria-hidden="true">🗺️</span>
          <PageHeader
            title={t('roadmap:direction.emptyTitle')}
            subtitle={t('roadmap:direction.emptyBody')}
            align="center"
          />
          <Button variant="primary" size="lg" className="gap-2" onClick={generate}>
            <Sparkles className="w-5 h-5" />
            {t('roadmap:direction.buildPlan')}
          </Button>
        </div>
      ) : roadmap ? (
        <div className="flex flex-col gap-8">
          <RoadmapHeaderCard directionName={roadmap.direction_name} targetYear={targetYear} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TargetCard target={roadmap.target} directionName={roadmap.direction_name} />
            <GrowthFocusCard growthFocus={roadmap.growth_focus} />
          </div>

          <div>
            <SectionHeading title={t('roadmap:direction.yourYearPath')} className="mb-1" />
            <p className="text-body text-secondary mb-6">
              {t('roadmap:direction.yearPathSubtitle')}
            </p>
            <Spine
              nodes={roadmap.stages.map((stage, i): SpineNode => ({
                id: stage.horizon,
                status: i === 0 ? 'current' : 'upcoming',
                goal: i === roadmap.stages.length - 1,
                label: DIRECTION_HORIZON_LABELS[stage.horizon]
                  ? t(DIRECTION_HORIZON_LABELS[stage.horizon])
                  : stage.horizon,
              }))}
              showLabels
              className="mb-10"
              ariaLabel={t('roadmap:direction.horizonsAria')}
            />

            {/* Horizon grid per spec 07 — hairline-divided Paper cells, one
             *  per stage. No milestone-complete banner is rendered below it:
             *  `DirectionStage`/`RoadmapStep` (shared/types) carry no
             *  completion timestamp or checklist-progress field, so there is
             *  no real "a horizon just closed" event to key a banner off.
             *  Building one here would mean either a static always-shown
             *  banner or a fabricated "just completed" state — both against
             *  the brief, so it's left out until the API exposes real
             *  horizon-completion data. */}
            <div
              className="grid grid-cols-1 lg:grid-cols-4 rounded-[var(--radius)] overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {roadmap.stages.map((stage, i) => (
                <HorizonCard
                  key={stage.horizon}
                  stage={stage}
                  isFirst={i === 0}
                  isLast={i === roadmap.stages.length - 1}
                  targetYear={targetYear}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <DirectionVerdictCard directionName={roadmap.direction_name} inquiryPath={inquiryPath} />
            <SubjectsGapSection
              subjects={roadmap.subjects_to_focus}
              subjectsEasy={subjectsEasy}
            />
          </div>

          <SkillsSection
            skills={roadmap.skills_to_build}
            subjects={roadmap.subjects_to_focus}
          />
          <UniversityTrackSection track={roadmap.university_track} />

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-start">
            <Button
              variant="ghost"
              size="lg"
              className="sm:w-auto"
              onClick={() => navigate('/results')}
            >
              {t('common:backToResults')}
            </Button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
