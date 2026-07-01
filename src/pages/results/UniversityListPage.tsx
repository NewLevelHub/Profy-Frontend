import { memo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { ProgramBrief } from '@/shared/types';
import { formatCost } from '@/pages/results/utils/programUtils';
import { COUNTRY_FILTERS, useUniversityList } from '@/pages/results/hooks/useUniversityList';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProgramCardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 22, padding: '26px 26px 22px', boxShadow: '0 6px 18px rgba(30,27,75,.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div style={{ display: 'flex', gap: 18 }}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-[52px] w-full rounded-[16px]" />
    </div>
  );
}

// ── Program card ──────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: ProgramBrief;
  onSelect: (id: string) => void;
}

const ProgramCard = memo(function ProgramCard({ program, onSelect }: ProgramCardProps) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 22, padding: '26px 26px 22px', boxShadow: '0 6px 18px rgba(30,27,75,.06)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Title + country badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 4 }}>
        <h3 style={{ fontSize: 21, fontWeight: 900, margin: 0, lineHeight: 1.2, color: '#1E1B4B' }}>{program.name}</h3>
        <span style={{ flexShrink: 0, background: '#EDE9FE', color: '#5B21B6', fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 9999, whiteSpace: 'nowrap' }}>
          {program.university.country}
        </span>
      </div>

      {/* University name */}
      <div style={{ fontSize: 16, fontWeight: 600, color: '#9CA3AF', marginBottom: 14 }}>{program.university.name}</div>

      {/* Description */}
      {program.description && program.description.length > 0 && (
        <p style={{ fontSize: 15, fontWeight: 600, color: '#4B5563', lineHeight: 1.55, margin: '0 0 16px' }}>
          {program.description.length > 120 ? program.description.slice(0, 120) + '...' : program.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18, fontSize: 15, fontWeight: 700, color: '#4B5563' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🌐 {program.language}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>💰 {formatCost(program.cost_per_year)}</span>
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(program.id)}
        style={{ width: '100%', height: 52, border: '1.5px solid #DDD6FE', borderRadius: 16, background: '#fff', color: '#7C3AED', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}
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
        <p className="text-body text-secondary max-w-sm">
          Этот раздел открыт для учеников старшей школы, планирующих поступление в вуз.
        </p>
        <Button onClick={() => navigate('/results')}>Назад к результатам</Button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '44px 24px 80px', animation: 'pf-fade-up .5s ease both' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>

        {/* Nav + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', color: '#7C3AED', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            ← Назад
          </button>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, letterSpacing: '-.01em', color: '#1E1B4B' }}>Университеты</h1>
        </div>

        {/* Country filter chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }} role="group" aria-label="Фильтр по стране">
          {COUNTRY_FILTERS.map(filter => (
            <button
              key={filter.label}
              onClick={() => setActiveCountry(filter.value)}
              aria-pressed={activeCountry === filter.value}
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: activeCountry === filter.value ? 'none' : '1.5px solid #DDD6FE',
                background: activeCountry === filter.value ? '#7C3AED' : '#fff',
                color: activeCountry === filter.value ? '#fff' : '#4B5563',
                transition: 'all .15s',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 18 }}>Загрузка...</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 18 }}>
              {programs.length} программ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {programs.map(program => (
                <ProgramCard key={program.id} program={program} onSelect={handleProgramClick} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
