import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useResultStore } from '@/shared/store/result';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useUniversityList } from '@/pages/results/hooks/useUniversityList';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';
import { DomainCardFrame, DomainKicker } from '@/pages/results/components/DomainCardParts';

export default function DirectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const report = useResultStore(s => s.report);
  const selectedDirectionSlug = useDirectionRoadmapStore(s => s.selectedDirectionSlug);
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);

  const {
    programs,
    isLoading: programsLoading,
    error: programsError,
    activeCountry,
    setActiveCountry,
    isAllowed: showUniversities,
    refetch: refetchPrograms,
  } = useUniversityList();

  const direction = report && report.interest_instrument === 'riasec'
    ? report.careers.find(d => d.slug === slug)
    : undefined;
  const hasRoadmap = selectedDirectionSlug === slug;

  const skills = direction?.skills_needed ?? [];
  const subjects = direction?.subjects_to_develop ?? [];

  if (!direction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔍</span>
        <h2 className="text-h1 font-extrabold text-primary">Направление не найдено</h2>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">

      <button
        className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity w-fit"
        onClick={() => navigate('/results')}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к результатам
      </button>

      <div className="flex flex-col gap-2">
        <PageHeader title={direction.name} />
        {direction.description && direction.description.length > 0 && (
          <p className="text-body text-secondary leading-relaxed">{direction.description}</p>
        )}
      </div>

      <DomainCardFrame ariaLabel="Почему тебе подходит">
        <DomainKicker>Почему тебе подходит</DomainKicker>
        <p className="text-body text-primary leading-relaxed">{direction.why}</p>
        {direction.matched_strengths.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {direction.matched_strengths.map((strength, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-pill text-caption font-semibold bg-surface text-brand"
              >
                {strength}
              </span>
            ))}
          </div>
        )}
      </DomainCardFrame>

      {skills.length > 0 && (
        <DomainCardFrame ariaLabel="Навыки для развития">
          <DomainKicker>Навыки для развития</DomainKicker>
          <ul className="flex flex-col gap-2.5">
            {skills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2.5 text-body text-primary">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {skill}
              </li>
            ))}
          </ul>
        </DomainCardFrame>
      )}

      {subjects.length > 0 && (
        <DomainCardFrame ariaLabel="Предметы для изучения">
          <DomainKicker>Предметы для изучения</DomainKicker>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subj, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-pill text-caption font-semibold text-secondary bg-surface border border-default"
              >
                {subj}
              </span>
            ))}
          </div>
        </DomainCardFrame>
      )}

      {/* Always present — contract guarantees non-empty try_now */}
      <DomainCardFrame ariaLabel="Попробуй прямо сейчас">
        <DomainKicker>Попробуй прямо сейчас</DomainKicker>
        <p className="text-body text-primary leading-relaxed">{direction.try_now}</p>
      </DomainCardFrame>

      {/* Universities/programs — inline, not behind a separate click-through
          anymore. Same senior-only gate as before (`useUniversityList`'s
          own `isAllowed`), just no longer conditioned on which of
          profession/university goal was picked (they're merged). */}
      {showUniversities && (
        <div>
          <DomainKicker>Университеты и программы</DomainKicker>
          <ProgramListSection
            programs={programs}
            isLoading={programsLoading}
            error={programsError}
            activeCountry={activeCountry}
            onCountryChange={setActiveCountry}
            refetch={refetchPrograms}
            onSelectProgram={setSelectedProgramId}
            selectedProgramId={selectedProgramId}
            onViewDetail={(id) => navigate(`/results/directions/${encodeURIComponent(slug!)}/universities/${id}`)}
          />
        </div>
      )}

      {hasRoadmap && (
        <Button
          variant="primary"
          size="lg"
          className="gap-2 w-fit"
          onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/roadmap`)}
        >
          <Map className="w-5 h-5" />
          Мой план по направлению
        </Button>
      )}
    </PageContainer>
  );
}
