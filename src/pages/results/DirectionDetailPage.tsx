import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Mascot } from '@/shared/ui/Mascot';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';
import { useResults } from '@/pages/results/hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { useUniversityList } from '@/pages/results/hooks/useUniversityList';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';
import { DomainCardFrame, DomainKicker } from '@/pages/results/components/DomainCardParts';

function capitalizeFirst(text: string): string {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;
}

function DirectionDetailSkeleton() {
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

export default function DirectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('results');

  const { report, isLoading, isTranslating, error, refetch } = useResults();
  const selectedDirectionSlug = useDirectionRoadmapStore(s => s.selectedDirectionSlug);

  const {
    programs,
    isLoading: programsLoading,
    error: programsError,
    activeCountry,
    setActiveCountry,
    countryFilters,
    isAllowed: showUniversities,
    toggleFavorite,
    refetch: refetchPrograms,
  } = useUniversityList();

  const direction = report && report.interest_instrument === 'riasec'
    ? report.careers.find(d => d.slug === slug)
    : undefined;
  const hasRoadmap = selectedDirectionSlug === slug;

  const skills = direction?.skills_needed ?? [];
  const subjects = direction?.subjects_to_develop ?? [];

  if (isLoading) {
    return <DirectionDetailSkeleton />;
  }

  // Language switched — backend is translating the existing report (see
  // useResults `isTranslating`); same mascot screen as ResultsPage.
  if (isTranslating) {
    return (
      <PageContainer>
        <ResultLoadingView className="min-h-[70vh]" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">{t('direction.errorTitle')}</h2>
        <p className="text-body text-secondary">{error}</p>
        <Button onClick={() => refetch()}>{t('common:retry')}</Button>
      </div>
    );
  }

  if (!direction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔍</span>
        <h2 className="text-h1 font-extrabold text-primary">{t('direction.notFoundTitle')}</h2>
        <Button onClick={() => navigate('/results')}>{t('common:backToResults')}</Button>
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
        {t('common:backToResults')}
      </button>

      <PageHeader title={direction.name} />

      {direction.description && direction.description.length > 0 && (
        <section aria-label={t('direction.descriptionAria')}>
          <Card className="bg-brand-subtle flex flex-col gap-3">
            <p className="text-body text-primary leading-relaxed">{direction.description}</p>
          </Card>
        </section>
      )}

      {(skills.length > 0 || subjects.length > 0) && (
        <DomainCardFrame ariaLabel={t('direction.skillsSubjectsAria')}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex flex-col gap-2">
              <DomainKicker>{t('direction.skillsSubjectsKicker')}</DomainKicker>
              <p className="text-body text-primary leading-relaxed">
                {t('direction.skillsSubjectsBody')}
              </p>
            </div>
            <Mascot state="transition" size={68} className="flex-shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skills.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">{t('direction.skills')}</p>
                <div className="flex flex-col gap-2">
                  {skills.map((skill, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subjects.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">{t('direction.subjects')}</p>
                <div className="flex flex-col gap-2">
                  {subjects.map((subj, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 rounded-[var(--radius)] border border-[var(--hairline)] bg-surface text-body-sm font-semibold text-primary"
                    >
                      {subj}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DomainCardFrame>
      )}

      {/* Always present — contract guarantees non-empty try_now; matched_strengths above it is optional */}
      <DomainCardFrame ariaLabel={t('direction.whyFitAria')}>
        {direction.matched_strengths.length > 0 && (
          <div className="flex flex-col gap-3">
            <DomainKicker>{t('direction.whyFitKicker')}</DomainKicker>
            <p className="text-body text-primary leading-relaxed">
              {direction.matched_strengths.join(', ')}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <DomainKicker>{t('direction.tryNowKicker')}</DomainKicker>
          <p className="text-body text-primary leading-relaxed">{capitalizeFirst(direction.try_now)}</p>
        </div>
      </DomainCardFrame>

      {/* Universities/programs — inline, not behind a separate click-through
          anymore. Same senior-only gate as before (`useUniversityList`'s
          own `isAllowed`), just no longer conditioned on which of
          profession/university goal was picked (they're merged). */}
      {showUniversities && (
        <div>
          <DomainKicker>{t('direction.universitiesKicker')}</DomainKicker>
          <ProgramListSection
            programs={programs}
            isLoading={programsLoading}
            error={programsError}
            activeCountry={activeCountry}
            onCountryChange={setActiveCountry}
            countryFilters={countryFilters}
            refetch={refetchPrograms}
            detailPathFor={(id) => `/results/directions/${encodeURIComponent(slug!)}/universities/${id}`}
            onToggleFavorite={toggleFavorite}
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
          {t('direction.myPlan')}
        </Button>
      )}
    </PageContainer>
  );
}
