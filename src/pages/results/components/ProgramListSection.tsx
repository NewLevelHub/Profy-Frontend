import { memo } from 'react';
import { Globe, GraduationCap, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import type { ProgramBrief } from '@/shared/types';
import type { CountryFilter } from '@/pages/results/hooks/useUniversityList';
import { UniversityRankBadges } from './UniversityRankBadges';

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
  index?: number;
  onViewDetail: (id: string) => void;
}

// Single action now — no separate "select" state. "Подробнее" is a plain
// visible button; the hover feedback lives on that button itself (Button's
// own ghost hover state), not a whole-card overlay.
const ProgramCard = memo(function ProgramCard({ program, index, onViewDetail }: ProgramCardProps) {
  return (
    <Card className="!p-6 flex flex-col h-full transition-colors">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-display-sm font-black leading-snug text-primary m-0">
          {index && `${index}. `}{program.name}
        </h3>
        <span className="shrink-0 bg-brand-subtle text-brand text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
          {program.university.country}
        </span>
      </div>

      <div className="text-base font-semibold text-muted mb-3 flex flex-col gap-2">
        <span>{program.university.name}</span>
        <UniversityRankBadges university={program.university} size="sm" />
      </div>

      {(() => {
        const desc = (program.description && program.description.length > 40)
          ? program.description
          : (program.university.description || program.description);
        if (!desc) return null;
        return (
          <p className="text-body-sm font-semibold text-secondary leading-relaxed mb-4 flex-1">
            {desc.length > 120 ? desc.slice(0, 120) + '...' : desc}
          </p>
        );
      })()}

      <Button
        variant="ghost"
        className="w-full h-[52px] rounded-[var(--radius)] mt-auto cursor-pointer"
        onClick={() => onViewDetail(program.id)}
      >
        Подробнее
      </Button>
    </Card>
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
  onViewDetail: (id: string) => void;
  sortDirection?: 'asc' | 'desc';
  onToggleSort?: () => void;
}

/**
 * Shared program list — country filter row + loading/error/empty states +
 * grid of ProgramCard. Used both by the standalone `/universities` page and
 * inline on `DirectionDetailPage` — one implementation, not duplicated
 * markup. Every card is a single click-through to detail; "Подробнее" only
 * appears as a hover overlay (see ProgramCard).
 */
export function ProgramListSection({
  programs,
  isLoading,
  error,
  activeCountry,
  onCountryChange,
  countryFilters,
  refetch,
  onViewDetail,
  sortDirection,
  onToggleSort,
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
          <GraduationCap className="w-12 h-12 text-muted" aria-hidden="true" />
          <p className="text-label font-bold text-primary">Программы не найдены</p>
          <p className="text-body text-secondary">Попробуй выбрать другую страну</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-sm font-bold text-muted">
            <span>{programs.length} программ</span>
            {onToggleSort && sortDirection && (
              <button
                onClick={onToggleSort}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-default/40 hover:bg-default/70 text-secondary text-xs font-extrabold border-none cursor-pointer transition-colors"
              >
                Сортировка: {sortDirection === 'asc' ? 'по убыванию рейтинга' : 'по возрастанию рейтинга'}
                {sortDirection === 'asc'
                  ? <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                  : <ArrowUpWideNarrow className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index + 1}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
