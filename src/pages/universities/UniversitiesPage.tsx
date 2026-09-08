import { ChevronLeft, ChevronRight, GraduationCap, Star } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { pluralize } from '@/shared/lib/plural';
import { cn } from '@/shared/lib/cn';
import { useUniversities } from './hooks/useUniversities';
import { UniversityCard } from './components/UniversityCard';
import { UniversityCardSkeleton } from './components/UniversityCardSkeleton';
import { UniversityFilters } from './components/UniversityFilters';

export default function UniversitiesPage() {
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
    handleOpen,
    toggleFavorite,
  } = useUniversities();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Университеты"
        subtitle="Справочник вузов Казахстана и других стран. Отмечай звёздочкой те, что понравились — они будут первыми и в подборе."
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
          <p className="text-body text-danger">{error}</p>
          <Button variant="ghost" onClick={() => refetch()}>Повторить</Button>
        </div>
      ) : universities.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          {onlyFavorites ? (
            <>
              <Star className="w-12 h-12 text-muted" aria-hidden="true" />
              <p className="text-label font-bold text-primary">Пока ничего не в избранном</p>
              <p className="text-body text-secondary">
                Нажми на звёздочку у понравившегося вуза — он появится здесь
              </p>
            </>
          ) : (
            <>
              <GraduationCap className="w-12 h-12 text-muted" aria-hidden="true" />
              <p className="text-label font-bold text-primary">Университеты не найдены</p>
              <p className="text-body text-secondary">Попробуй изменить запрос или выбрать другую страну</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted m-0">
              {pluralize(total, 'университет', 'университета', 'университетов')}
            </p>
            {isFetching && !isLoading && (
              <span className="text-xs font-bold text-muted animate-pulse">Обновляем…</span>
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
                onOpen={handleOpen}
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
                aria-label="Предыдущая страница"
                className="min-w-11 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
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
                aria-label="Следующая страница"
                className="min-w-11 px-3"
              >
                <span className="hidden sm:inline">Дальше</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
