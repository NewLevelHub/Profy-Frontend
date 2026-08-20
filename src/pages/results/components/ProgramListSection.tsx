import { memo } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Button } from '@/shared/ui/Button';
import type { ProgramBrief } from '@/shared/types';
import type { CountryFilter } from '@/pages/results/hooks/useUniversityList';

function ProgramCardSkeleton() {
  return (
    <div className="bg-surface border border-default rounded-[var(--radius)] p-6 shadow-card flex flex-col gap-3">
      <div className="flex justify-between gap-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-[52px] w-full rounded-2xl" />
    </div>
  );
}

interface ProgramCardProps {
  program: ProgramBrief;
  /** Only needed for the single-button (no onViewDetail) flow — standalone
   *  list-browsing (UniversityListPage) uses it to navigate on click. */
  onSelect?: (id: string) => void;
  /** When provided, renders a "Подробнее" button that navigates to detail.
   *  Omit it to keep the original single-click-to-detail behavior. */
  onViewDetail?: (id: string) => void;
}

const ProgramCard = memo(function ProgramCard({ program, onSelect, onViewDetail }: ProgramCardProps) {
  return (
    <div className="bg-surface border border-default rounded-[var(--radius)] p-6 shadow-card flex flex-col h-full transition-colors">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-display-sm font-black leading-snug text-primary m-0">{program.name}</h3>
        <span className="shrink-0 bg-brand-subtle text-brand text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
          {program.university.country}
        </span>
      </div>

      <div className="text-base font-semibold text-muted mb-3">{program.university.name}</div>

      {program.description && program.description.length > 0 && (
        <p className="text-body-sm font-semibold text-secondary leading-relaxed mb-4 flex-1">
          {program.description.length > 120 ? program.description.slice(0, 120) + '...' : program.description}
        </p>
      )}

      {onViewDetail ? (
        <Button
          variant="ghost"
          className="w-full h-[52px] border border-default rounded-[var(--radius)] mt-auto"
          onClick={() => onViewDetail(program.id)}
        >
          Подробнее
        </Button>
      ) : (
        <button
          onClick={() => onSelect?.(program.id)}
          className="w-full h-[52px] border-[1.5px] border-strong rounded-[var(--radius)] bg-surface text-brand text-base font-extrabold cursor-pointer hover:bg-brand-subtle transition-colors mt-auto"
        >
          Посмотреть требования
        </button>
      )}
    </div>
  );
});

interface ProgramListSectionProps {
  programs: ProgramBrief[];
  isLoading: boolean;
  error: string | null;
  activeCountry: string | undefined;
  onCountryChange: (country: string | undefined) => void;
  countryFilters: CountryFilter[];
  refetch: () => void;
  onSelectProgram?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

/**
 * Shared program list — country filter row + loading/error/empty states +
 * grid of ProgramCard. Used both by the standalone `/universities` page
 * (click a card → navigate to detail) and inline on `DirectionDetailPage`
 * (click a card → navigate to detail via "Подробнее") — one implementation,
 * not duplicated markup.
 */
export function ProgramListSection({
  programs,
  isLoading,
  error,
  activeCountry,
  onCountryChange,
  countryFilters,
  refetch,
  onSelectProgram,
  onViewDetail,
}: ProgramListSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Фильтр по стране">
        {countryFilters.map(filter => (
          <button
            key={filter.label}
            onClick={() => onCountryChange(filter.value)}
            aria-pressed={activeCountry === filter.value}
            className={
              activeCountry === filter.value
                ? 'px-5 py-2 rounded-pill text-sm font-bold bg-brand text-on-brand border-none cursor-pointer'
                : 'px-5 py-2 rounded-pill text-sm font-bold bg-surface text-secondary border-[1.5px] border-strong cursor-pointer hover:border-brand transition-colors'
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <>
          <div className="text-sm font-bold text-muted">Загрузка...</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {Array.from({ length: 6 }, (_, i) => <ProgramCardSkeleton key={i} />)}
          </div>
        </>
      ) : error !== null ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error}</p>
          <Button variant="ghost" onClick={() => refetch()}>Повторить</Button>
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl select-none" aria-hidden="true">🎓</span>
          <p className="text-label font-bold text-primary">Программы не найдены</p>
          <p className="text-body text-secondary">Попробуй выбрать другую страну</p>
        </div>
      ) : (
        <>
          <div className="text-sm font-bold text-muted">
            {programs.length} программ
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {programs.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                onSelect={onSelectProgram}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
