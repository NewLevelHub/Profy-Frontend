import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { BackLink } from '@/shared/ui/BackLink';
import { PageContainer } from '@/shared/ui/PageContainer';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { useBackTo } from '@/shared/lib/useBackTo';
import { useUniversityList } from '@/pages/results/hooks/useUniversityList';
import { ProgramListSection } from '@/pages/results/components/ProgramListSection';

export default function UniversityListPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams<{ slug: string }>();
  const goBack = useBackTo(`/results/directions/${encodeURIComponent(slug)}`);
  const { t } = useTranslation('results');
  const {
    programs,
    isLoading,
    error,
    activeCountry,
    setActiveCountry,
    countryFilters,
    sortDirection,
    toggleSortDirection,
    isAllowed,
    programDetailPath,
    toggleFavorite,
    refetch,
  } = useUniversityList();

  if (!isAllowed) {
    return (
      <PageContainer className="rd-catalog"><JourneyEmptyState illustration="/mascot/redesign/book.png"
        title={t('universityList.lockedTitle')} body={t('universityList.lockedBody')}
        actionLabel={t('common:backToResults')} onAction={() => navigate('/results')} /></PageContainer>
    );
  }

  return (
    <PageContainer className="rd-catalog rd-detail">
      <div className="rd-program-list-heading">
        <BackLink onClick={goBack} className="rd-detail-back">
          {t('common:back')}
        </BackLink>
        <StudentPageHeading kicker={t('direction.universitiesKicker')} title={t('universityList.title')} />
      </div>

      <ProgramListSection
        programs={programs}
        isLoading={isLoading}
        error={error}
        activeCountry={activeCountry}
        onCountryChange={setActiveCountry}
        countryFilters={countryFilters}
        refetch={refetch}
        detailPathFor={programDetailPath}
        onToggleFavorite={toggleFavorite}
        sortDirection={sortDirection}
        onToggleSort={toggleSortDirection}
      />
    </PageContainer>
  );
}
