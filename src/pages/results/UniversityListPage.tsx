import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔒</span>
        <h2 className="text-h1 font-extrabold text-primary">{t('universityList.lockedTitle')}</h2>
        <p className="text-body text-secondary max-w-md">
          {t('universityList.lockedBody')}
        </p>
        <Button onClick={() => navigate('/results')}>{t('common:backToResults')}</Button>
      </div>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-brand text-label font-extrabold hover:opacity-70 transition-opacity shrink-0"
        >
          {t('common:back')}
        </button>
        <PageHeader title={t('universityList.title')} className="flex-1 min-w-0" />
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
