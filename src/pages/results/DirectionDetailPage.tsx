import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { BackLink } from '@/shared/ui/BackLink';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';
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

function SkillTile({ children, tone }: { children: string; tone: 'pine' | 'lake' }) {
  return (
    <div
      className={cn(
        'field-tile px-3.5 py-3 text-body-sm font-semibold text-[color:var(--text-heading)] leading-snug',
        'border-l-[3px]',
        tone === 'pine'
          ? 'border-l-[color:var(--pine)]'
          : 'border-l-[color:var(--lake)]',
      )}
    >
      {capitalizeFirst(children)}
    </div>
  );
}

function ColumnTitle({ children, tone }: { children: string; tone: 'pine' | 'lake' }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: tone === 'pine' ? 'var(--pine)' : 'var(--lake)' }}
        aria-hidden="true"
      />
      <Heading level="display-sm" as="h3" className="text-[color:var(--text-heading)] m-0">
        {children}
      </Heading>
    </div>
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
        <h2 className="text-h1 font-extrabold text-primary">{t('direction.errorTitle')}</h2>
        <p className="text-body text-secondary">{error}</p>
        <Button onClick={() => refetch()}>{t('common:retry')}</Button>
      </div>
    );
  }

  if (!direction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <h2 className="text-h1 font-extrabold text-primary">{t('direction.notFoundTitle')}</h2>
        <Button onClick={() => navigate('/results')}>{t('common:backToResults')}</Button>
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <BackLink onClick={() => navigate('/results')}>
        {t('common:backToResults')}
      </BackLink>

      <PageHeader
        kicker={t('direction.pageKicker')}
        title={direction.name}
      />

      {direction.description && direction.description.length > 0 && (
        <section
          aria-label={t('direction.descriptionAria')}
          className="panel-glass !p-5 sm:!p-7 bg-[color-mix(in_srgb,var(--pine)_5%,var(--paper))]"
        >
          <Text variant="body-md" className="text-primary leading-relaxed">
            {direction.description}
          </Text>
        </section>
      )}

      {(skills.length > 0 || subjects.length > 0) && (
        <DomainCardFrame ariaLabel={t('direction.skillsSubjectsAria')}>
          <div className="flex items-start justify-between gap-5 flex-wrap">
            <div className="min-w-0 flex flex-col gap-2.5 flex-1">
              <DomainKicker>{t('direction.skillsSubjectsKicker')}</DomainKicker>
              <Heading level="display-sm" as="h2" className="text-[color:var(--text-heading)] text-balance m-0">
                {t('direction.skillsSubjectsTitle')}
              </Heading>
              <Text variant="body-sm" className="text-secondary max-w-[52ch]">
                {t('direction.skillsSubjectsBody')}
              </Text>
            </div>
            <div className="journey-mascot-well shrink-0">
              <Mascot state="transition" size={72} blink={false} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {skills.length > 0 && (
              <div className="flex flex-col gap-3">
                <ColumnTitle tone="pine">{t('direction.skills')}</ColumnTitle>
                <div className="flex flex-col gap-2">
                  {skills.map((skill, i) => (
                    <SkillTile key={i} tone="pine">{skill}</SkillTile>
                  ))}
                </div>
              </div>
            )}

            {subjects.length > 0 && (
              <div className="flex flex-col gap-3">
                <ColumnTitle tone="lake">{t('direction.subjects')}</ColumnTitle>
                <div className="flex flex-col gap-2">
                  {subjects.map((subj, i) => (
                    <SkillTile key={i} tone="lake">{subj}</SkillTile>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DomainCardFrame>
      )}

      <DomainCardFrame ariaLabel={t('direction.whyFitAria')}>
        {direction.matched_strengths.length > 0 && (
          <div className="flex flex-col gap-3">
            <DomainKicker>{t('direction.whyFitKicker')}</DomainKicker>
            <p className="text-body-md font-semibold text-[color:var(--text-heading)] leading-relaxed m-0">
              {direction.matched_strengths.join(', ')}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <DomainKicker>{t('direction.tryNowKicker')}</DomainKicker>
          <p className="text-body-md text-primary leading-relaxed m-0">
            {capitalizeFirst(direction.try_now)}
          </p>
        </div>
      </DomainCardFrame>

      {showUniversities && (
        <div className="flex flex-col gap-3">
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
          className="w-fit rounded-pill"
          onClick={() => navigate(`/results/directions/${encodeURIComponent(slug!)}/roadmap`)}
        >
          {t('direction.myPlan')}
        </Button>
      )}
    </PageContainer>
  );
}
