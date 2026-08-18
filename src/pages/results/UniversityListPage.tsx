import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { ProgramBrief } from '@/shared/types';
import { formatCost, truncateCost, getRankingBadge } from '@/pages/results/utils/programUtils';
import { COUNTRY_FILTERS, useUniversityList } from '@/pages/results/hooks/useUniversityList';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProgramCardSkeleton() {
  return (
    <div className="bg-surface border border-[#EDE9FE] rounded-[22px] p-6 shadow-card flex flex-col gap-3">
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

// ── Program card ──────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: ProgramBrief;
  onSelect: (id: string) => void;
}

const ProgramCard = memo(function ProgramCard({ program, onSelect }: ProgramCardProps) {
  const rankingBadge = getRankingBadge(program.university);

  return (
    <div className="bg-surface border border-[#EDE9FE] rounded-[22px] p-6 shadow-card flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-[21px] font-black leading-snug text-primary m-0">{program.name}</h3>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <span className="bg-[#EDE9FE] text-[#5B21B6] text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
            {program.university.country}
          </span>
          {rankingBadge && (
            <span className="bg-[#FFF7ED] text-[#C2410C] text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
              🏆 {rankingBadge}
            </span>
          )}
        </div>
      </div>

      <div className="text-base font-semibold text-muted mb-3">
        {program.university.name}
        {program.university.city && <span className="text-muted font-normal">, {program.university.city}</span>}
      </div>

      {program.description && program.description.length > 0 && (
        <p className="text-[15px] font-semibold text-secondary leading-relaxed mb-4 flex-1">
          {program.description.length > 120 ? program.description.slice(0, 120) + '...' : program.description}
        </p>
      )}

      <div className="flex gap-4 flex-wrap mb-4 text-[15px] font-bold text-secondary">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">🌐 {program.language}</span>
        {/* cost_label is free text (a full sentence for some sources) — truncate
            on the card, ProgramDetailPage shows it in full. */}
        <span className="inline-flex items-start gap-1.5">💰 {truncateCost(formatCost(program.cost_per_year, program.cost_label))}</span>
      </div>

      <button
        onClick={() => onSelect(program.id)}
        className="w-full h-[52px] border-[1.5px] border-[#DDD6FE] rounded-2xl bg-surface text-brand text-base font-extrabold cursor-pointer hover:bg-brand-subtle transition-colors mt-auto"
      >
        Посмотреть требования
      </button>
    </div>
  );
});

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UniversityListPage() {
  const navigate = useNavigate();
  const {
    programs,
    isLoading,
    error,
    activeCountry,
    setActiveCountry,
    isAllowed,
    handleProgramClick,
    refetch,
  } = useUniversityList();

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🔒</span>
        <h2 className="text-h1 font-extrabold text-primary">Раздел недоступен</h2>
        <p className="text-body text-secondary max-w-md">
          Этот раздел открыт для учеников старшей школы, планирующих поступление в вуз.
        </p>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand text-label font-extrabold hover:opacity-70 transition-opacity shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <PageHeader title="Университеты" className="flex-1 min-w-0" />
      </div>

      <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Фильтр по стране">
        {COUNTRY_FILTERS.map(filter => (
          <button
            key={filter.label}
            onClick={() => setActiveCountry(filter.value)}
            aria-pressed={activeCountry === filter.value}
            className={
              activeCountry === filter.value
                ? 'px-5 py-2 rounded-pill text-sm font-bold bg-brand text-on-brand border-none cursor-pointer'
                : 'px-5 py-2 rounded-pill text-sm font-bold bg-surface text-secondary border-[1.5px] border-[#DDD6FE] cursor-pointer hover:border-brand transition-colors'
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
              <ProgramCard key={program.id} program={program} onSelect={handleProgramClick} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
