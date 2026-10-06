import type { ReactNode } from 'react';
import type { RiasecResultResponse } from '@/shared/types';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { BackLink } from '@/shared/ui/BackLink';
import { PageContainer } from '@/shared/ui/PageContainer';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { cn } from '@/shared/lib/cn';
import { useResults } from '@/pages/results/hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { useUniversityList } from '@/pages/results/hooks/useUniversityList';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';
import { DomainCardFrame, DomainKicker } from '@/pages/results/components/DomainCardParts';
import { reasonsBeyondWhy } from '@/pages/results/utils/careerReasons';

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
      <PageContainer className="rd-catalog"><JourneyEmptyState illustration="/mascot/redesign/rest.png"
        title={t('direction.errorTitle')} body={error} actionLabel={t('common:retry')} onAction={() => refetch()} /></PageContainer>
    );
  }

  if (!direction) {
    return (
      <PageContainer className="rd-catalog"><JourneyEmptyState illustration="/mascot/redesign/book.png"
        title={t('direction.notFoundTitle')} body="" actionLabel={t('common:backToResults')} onAction={() => navigate('/results')} /></PageContainer>
    );
  }

  return <DirectionDetailView direction={direction} goBack={() => navigate('/results')}>
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
  </DirectionDetailView>;
}

export function DirectionDetailView({ direction, goBack, children }: {
  direction: RiasecResultResponse['careers'][number]; goBack: () => void; children?: ReactNode;
}) {
  const { t } = useTranslation('results');
  const skills = direction.skills_needed ?? [];
  const subjects = direction.subjects_to_develop ?? [];
  const fitReasons = reasonsBeyondWhy(direction);
  return (
    <PageContainer className="rd-catalog rd-detail rd-direction">
      <BackLink onClick={goBack} className="rd-detail-back">
        {t('common:backToResults')}
      </BackLink>

      <StudentPageHeading
        kicker={t('direction.pageKicker')}
        title={direction.name}
      />

      {direction.description && direction.description.length > 0 && (
        <section
          aria-label={t('direction.descriptionAria')}
          className="rd-direction-intro"
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
            <img className="rd-direction-mascot" src="/mascot/redesign/notepad.png" width={100} height={110} alt="" />
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
        <div className="flex flex-col gap-3">
          <DomainKicker>{t('direction.whyFitKicker')}</DomainKicker>
          <p className="text-body-md font-semibold text-[color:var(--text-heading)] leading-relaxed m-0">
            {direction.why}
          </p>
          {fitReasons.length > 0 && (
            <ul className="flex flex-col gap-2 m-0 pl-5 list-disc">
              {fitReasons.map((reason) => (
                <li key={reason.text} className="text-body-md text-primary leading-relaxed">
                  {reason.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <DomainKicker>{t('direction.tryNowKicker')}</DomainKicker>
          <p className="text-body-md text-primary leading-relaxed m-0">
            {capitalizeFirst(direction.try_now)}
          </p>
        </div>
      </DomainCardFrame>

      {children}
    </PageContainer>
  );
}
