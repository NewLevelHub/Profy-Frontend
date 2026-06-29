import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { ProgramBrief } from '@/shared/types';
import { formatCost } from '@/pages/results/utils/programUtils';
import { COUNTRY_FILTERS, useUniversityList } from '@/pages/results/hooks/useUniversityList';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProgramCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-3 mt-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-full mt-1" />
    </Card>
  );
}

// ── Program card ──────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: ProgramBrief;
  onSelect: (id: string) => void;
}

const ProgramCard = memo(function ProgramCard({ program, onSelect }: ProgramCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-label font-bold text-primary leading-snug">{program.name}</p>
          <p className="text-caption text-secondary">{program.university.name}</p>
        </div>
        <Badge variant="brand" className="flex-shrink-0">{program.university.country}</Badge>
      </div>

      {program.description && program.description.length > 0 && (
        <p className="text-caption text-secondary line-clamp-2">{program.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-caption text-secondary">
        <span>🌐 {program.language}</span>
        <span>💰 {formatCost(program.cost_per_year)}</span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="w-full mt-auto"
        onClick={() => onSelect(program.id)}
      >
        Посмотреть требования
      </Button>
    </Card>
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
        <p className="text-body text-secondary max-w-sm">
          Список университетов доступен только для старшеклассников с целью поступления в вуз.
        </p>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Nav */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <h1 className="text-h1 font-extrabold text-primary">Университеты</h1>
      </div>

      {/* Country filter chips */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Фильтр по стране">
        {COUNTRY_FILTERS.map(filter => (
          <button
            key={filter.label}
            onClick={() => setActiveCountry(filter.value)}
            className={cn(
              'px-4 py-1.5 rounded-pill text-caption font-semibold border transition-colors',
              activeCountry === filter.value
                ? 'bg-brand text-on-brand border-brand'
                : 'bg-surface text-secondary border-default hover:border-strong',
            )}
            aria-pressed={activeCountry === filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => <ProgramCardSkeleton key={i} />)}
        </div>
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
          <p className="text-caption text-muted mb-4">{programs.length} программ</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {programs.map(program => (
              <ProgramCard key={program.id} program={program} onSelect={handleProgramClick} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
