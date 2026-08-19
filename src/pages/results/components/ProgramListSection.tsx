import { memo } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Button } from '@/shared/ui/Button';
import type { ProgramBrief } from '@/shared/types';
import { formatCost, convertLabelCurrenciesToUsd, getUniversityRankingLabels } from '@/pages/results/utils/programUtils';
import { COUNTRY_FILTERS } from '@/pages/results/hooks/useUniversityList';

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
  onSelect: (id: string) => void;
  /** Visually marks this card as the chosen one — only meaningful when the
   *  caller has a "pick one" concept (inline usage on the direction page);
   *  standalone list-browsing (UniversityListPage) never passes this. */
  selected?: boolean;
  /** When provided, the card's own click becomes "select" (not navigate),
   *  and this renders a separate button for the navigate-to-detail action.
   *  Omit it to keep the original single-click-to-detail behavior. */
  onViewDetail?: (id: string) => void;
}

const ProgramCard = memo(function ProgramCard({ program, index, onSelect, selected, onViewDetail }: ProgramCardProps) {
  return (
    <div
      className="bg-surface border rounded-[var(--radius)] p-6 shadow-card flex flex-col h-full transition-colors"
      style={{
        borderColor: selected ? 'var(--brand)' : 'var(--border)',
        borderWidth: selected ? 2 : 1,
        background: selected ? 'color-mix(in srgb, var(--brand) 5%, var(--bg-surface))' : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-display-sm font-black leading-snug text-primary m-0">
          {index && `${index}. `}{program.name}
        </h3>
        <span className="shrink-0 bg-brand-subtle text-brand text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
          {program.university.country}
        </span>
      </div>

      <div className="text-base font-semibold text-muted mb-3 flex flex-wrap items-center gap-2">
        <span>{program.university.name}</span>
        {getUniversityRankingLabels(program.university).map((rankText, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-xs font-extrabold px-2.5 py-0.5 rounded-pill whitespace-nowrap"
          >
            🏆 {rankText}
          </span>
        ))}
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

      <div className="flex gap-4 flex-wrap mb-4 text-body-sm font-bold text-secondary">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">🌐 {program.language}</span>
        {/* No whitespace-nowrap here — converted free-text cost_label (e.g.
            "2 180–3 270 USD за семестр (бакалавриат) для студентов вне ЕС")
            can be long; it must wrap inside the card, not overflow it. */}
        <span className="inline-flex items-start gap-1.5">💰 {program.cost_per_year !== null ? formatCost(program.cost_per_year) : convertLabelCurrenciesToUsd(program.cost_label)}</span>
      </div>

      {onViewDetail ? (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onSelect(program.id)}
            className="flex-1 h-[52px] border-[1.5px] rounded-[var(--radius)] text-base font-extrabold cursor-pointer transition-colors"
            style={{
              borderColor: selected ? 'var(--brand)' : 'var(--border-strong)',
              background: selected ? 'var(--brand)' : 'var(--bg-surface)',
              color: selected ? 'var(--text-on-brand)' : 'var(--brand)',
            }}
          >
            {selected ? 'Выбрано' : 'Выбрать'}
          </button>
          <Button
            variant="ghost"
            className="h-[52px] px-4 border border-default rounded-[var(--radius)]"
            onClick={() => onViewDetail(program.id)}
          >
            Подробнее
          </Button>
        </div>
      ) : (
        <button
          onClick={() => onSelect(program.id)}
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
  refetch: () => void;
  onSelectProgram: (id: string) => void;
  selectedProgramId?: string;
  onViewDetail?: (id: string) => void;
  sortDirection?: 'asc' | 'desc';
  onToggleSort?: () => void;
}

/**
 * Shared program list — country filter row + loading/error/empty states +
 * grid of ProgramCard. Used both by the standalone `/universities` page
 * (click a card → navigate to detail) and inline on `DirectionDetailPage`
 * (click a card → select it locally, "Подробнее" navigates separately) —
 * one implementation, not duplicated markup.
 */
export function ProgramListSection({
  programs,
  isLoading,
  error,
  activeCountry,
  onCountryChange,
  refetch,
  onSelectProgram,
  selectedProgramId,
  onViewDetail,
  sortDirection,
  onToggleSort,
}: ProgramListSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Фильтр по стране">
        {COUNTRY_FILTERS.map(filter => (
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
          <div className="flex justify-between items-center text-sm font-bold text-muted">
            <span>{programs.length} программ</span>
            {onToggleSort && sortDirection && (
              <button
                onClick={onToggleSort}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-default/40 hover:bg-default/70 text-secondary text-xs font-extrabold border-none cursor-pointer transition-colors"
              >
                Сортировка: {sortDirection === 'asc' ? 'по убыванию рейтинга ⬇️' : 'по возрастанию рейтинга ⬆️'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index + 1}
                onSelect={onSelectProgram}
                selected={program.id === selectedProgramId}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
