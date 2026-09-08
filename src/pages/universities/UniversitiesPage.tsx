import { ChevronLeft, ChevronRight, GraduationCap, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { cn } from '@/shared/lib/cn';
import { useUniversities } from './hooks/useUniversities';
import { UniversityCard } from './components/UniversityCard';
import { UniversityCardSkeleton } from './components/UniversityCardSkeleton';
import { UniversityFilters } from './components/UniversityFilters';

export default function UniversitiesPage() {
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
  } = useUniversities();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={t('catalog.title')}
        subtitle={t('catalog.subtitle')}
      />

      <UniversityFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        countries={countries}
        activeCountry={activeCountry}
        onCountryChange={setActiveCountry}
        onlyFavorites={onlyFavorites}
        onToggleOnlyFavorites={toggleOnlyFavorites}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {Array.from({ length: 6 }, (_, i) => <UniversityCardSkeleton key={i} />)}
        </div>
      ) : error !== null ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{t('catalog.loadListFailed')}</p>
          <Button variant="ghost" onClick={() => refetch()}>{t('common:retry')}</Button>
        </div>
      ) : universities.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          {onlyFavorites ? (
            <>
              <Star className="w-12 h-12 text-muted" aria-hidden="true" />
              <p className="text-label font-bold text-primary">{t('catalog.emptyFavoritesTitle')}</p>
              <p className="text-body text-secondary">{t('catalog.emptyFavoritesBody')}</p>
            </>
          ) : (
            <>
              <GraduationCap className="w-12 h-12 text-muted" aria-hidden="true" />
              <p className="text-label font-bold text-primary">{t('catalog.emptyTitle')}</p>
              <p className="text-body text-secondary">{t('catalog.emptyBody')}</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted m-0">
              {t('catalog.count', { count: total })}
            </p>
            {isFetching && !isLoading && (
              <span className="text-xs font-bold text-muted animate-pulse">{t('catalog.updating')}</span>
            )}
          </div>

          <div
            className={cn(
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] transition-opacity duration-200',
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
            <div className="flex items-center justify-center gap-3 pt-4 pb-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label={t('catalog.prevPageAria')}
                className="min-w-11 px-3"
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
                className="min-w-11 px-3"
              >
                <span className="hidden sm:inline">{t('catalog.further')}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
