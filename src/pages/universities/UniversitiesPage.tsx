import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { StudentPageHeading } from '@/shared/ui/redesign/StudentPageHeading';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { cn } from '@/shared/lib/cn';
import { useUniversities } from './hooks/useUniversities';
import { UniversityCard } from './components/UniversityCard';
import { UniversityCardSkeleton } from './components/UniversityCardSkeleton';
import { UniversityFilters } from './components/UniversityFilters';

export default function UniversitiesPage() {
  return <UniversitiesView model={useUniversities()} />;
}

export function UniversitiesView({ model }: { model: Omit<ReturnType<typeof useUniversities>, 'refetch'> & { refetch: () => void } }) {
  const { t } = useTranslation(['results', 'common']);
  const {
    universities,
    total,
    page,
    totalPages,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
    searchInput,
    setSearchInput,
    countries,
    activeCountry,
    setActiveCountry,
    onlyFavorites,
    toggleOnlyFavorites,
    toggleFavorite,
  } = model;

  return (
    <PageContainer className="rd-catalog">
      <div className="rd-catalog-heading">
        <StudentPageHeading kicker={t('catalog.kicker')} title={t('catalog.title')} subtitle={t('catalogDesign.subtitle')} />
        <img src="/mascot/redesign/book.png" alt="" width={128} height={142} />
      </div>
      <div className="rd-catalog-filters">
        <UniversityFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          countries={countries}
          activeCountry={activeCountry}
          onCountryChange={setActiveCountry}
          onlyFavorites={onlyFavorites}
          onToggleOnlyFavorites={toggleOnlyFavorites}
        />
      </div>

      <div className="rd-catalog-results" aria-busy={isFetching}>
        {isLoading ? (
          <div className="rd-university-grid">
            {Array.from({ length: 6 }, (_, i) => <UniversityCardSkeleton key={i} />)}
          </div>
        ) : error !== null ? (
          <JourneyEmptyState
            illustration="/mascot/redesign/rest.png"
            title={t('error.somethingWrong')}
            body={t('catalog.loadListFailed')}
            actionLabel={t('common:retry')}
            onAction={() => refetch()}
          />
        ) : universities.length === 0 ? (
          <JourneyEmptyState
            illustration="/mascot/redesign/book.png"
            title={onlyFavorites ? t('catalog.emptyFavoritesTitle') : t('catalog.emptyTitle')}
            body={onlyFavorites ? t('catalog.emptyFavoritesBody') : t('catalog.emptyBody')}
          />
        ) : (
          <>
            <div className="rd-catalog-count">
              <p className="text-sm font-bold text-muted m-0">
                {t('catalog.count', { count: total })}
              </p>
              {isFetching && !isLoading && (
                <span className="text-xs font-bold text-muted animate-pulse">{t('catalog.updating')}</span>
              )}
            </div>

            <div
              className={cn(
                'rd-university-grid transition-opacity duration-200',
                isFetching && !isLoading && 'opacity-70',
              )}
            >
              {universities.map(university => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="rd-catalog-pagination">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  aria-label={t('catalog.prevPageAria')}
                  className="rd-button rd-button-outline rd-button-small"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('common:back')}</span>
                </Button>
                <span className="min-w-[5.5rem] text-center text-sm font-extrabold text-primary tabular-nums">
                  {page}
                  <span className="text-muted font-bold"> / {totalPages}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label={t('catalog.nextPageAria')}
                  className="rd-button rd-button-outline rd-button-small"
                >
                  <span className="hidden sm:inline">{t('catalog.further')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
