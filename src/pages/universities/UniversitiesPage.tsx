import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { Mascot } from '@/shared/ui/Mascot';
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
    <div className="flex flex-col">
      <PageContainer>
        <PageHeader
          className="mb-6"
          kicker={t('catalog.kicker')}
          title={t('catalog.title')}
          subtitle={t('catalog.subtitle')}
          aside={
            <div className="journey-mascot-well hidden sm:flex">
              <Mascot state="graduate" size={72} blink={false} />
            </div>
          }
        />
      </PageContainer>

      {/* Панель намеренно лежит РЯДОМ с PageContainer, а не внутри: только так
          она может погасить padding-inline у <main> и встать во всю ширину,
          как шапка. Внутри неё колонка возвращается вложенным PageContainer,
          чтобы контролы стояли по той же сетке, что и карточки.
          Отступа сверху нет: у sticky-узла внешний margin оставляет под шапкой
          сквозную щель, в которую видно проезжающие карточки. */}
      <div className="universities-filters-sticky">
        <PageContainer>
          <div className="filters-island">
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
        </PageContainer>
      </div>

      <PageContainer className="mt-6 flex flex-col gap-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {Array.from({ length: 6 }, (_, i) => <UniversityCardSkeleton key={i} />)}
          </div>
        ) : error !== null ? (
          <JourneyEmptyState
            mascotState="pause"
            title={t('error.somethingWrong')}
            body={t('catalog.loadListFailed')}
            actionLabel={t('common:retry')}
            onAction={() => refetch()}
          />
        ) : universities.length === 0 ? (
          <JourneyEmptyState
            mascotState={onlyFavorites ? 'waiting' : 'graduate'}
            title={onlyFavorites ? t('catalog.emptyFavoritesTitle') : t('catalog.emptyTitle')}
            body={onlyFavorites ? t('catalog.emptyFavoritesBody') : t('catalog.emptyBody')}
          />
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
    </div>
  );
}
