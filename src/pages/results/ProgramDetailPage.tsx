import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toDisplayString, formatCost, localizeKey } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProgramDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[20px] border border-[#EDE9FE] p-6 flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px' }}>{children}</h3>
  );
}

// ── Requirements table ────────────────────────────────────────────────────────

function RequirementsTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 14px rgba(30,27,75,.05)' }}>
      {entries.map(([key, value], i) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '14px 20px',
            borderTop: i > 0 ? '1px solid #EDE9FE' : undefined,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#4B5563' }}>{localizeKey(key)}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1E1B4B', textAlign: 'right' }}>{toDisplayString(value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Deadlines grid ────────────────────────────────────────────────────────────

function DeadlinesGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 16, padding: '16px 18px', boxShadow: '0 4px 14px rgba(30,27,75,.05)' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', marginBottom: 4 }}>{localizeKey(key)}</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#1E1B4B' }}>{toDisplayString(value)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error } = useProgramDetail();

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '30px 32px 56px', animation: 'pf-fade-up .5s ease both' }}>
      {/* Nav */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', color: '#7C3AED', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', padding: 0, marginBottom: 18 }}
      >
        ← Назад
      </button>

      {isLoading ? (
        <ProgramDetailSkeleton />
      ) : error !== null || !program ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error ?? 'Программа не найдена'}</p>
          <Button variant="ghost" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Title */}
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-.01em' }}>{program.name}</h1>
          <p style={{ fontSize: 17, color: '#6B7280', fontWeight: 700, margin: '0 0 16px' }}>{program.university.name}</p>

          {/* Meta badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 26 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EDE9FE', color: '#5B21B6', fontSize: 14, fontWeight: 800, padding: '7px 14px', borderRadius: 9999 }}>
              🌐 {program.language}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF7ED', color: '#C2410C', fontSize: 14, fontWeight: 800, padding: '7px 14px', borderRadius: 9999 }}>
              💰 {formatCost(program.cost_per_year)}
            </span>
          </div>

          {/* Description */}
          {program.description && program.description.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #EDE9FE', borderRadius: 20, padding: '24px 26px', marginBottom: 16, boxShadow: '0 4px 14px rgba(30,27,75,.05)' }}>
              <SectionHeading>📋 Описание</SectionHeading>
              <p style={{ fontSize: 15, color: '#4B5563', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{program.description}</p>
            </div>
          )}

          {/* Who it's for */}
          {program.who_its_for && program.who_its_for.length > 0 && (
            <div style={{ background: '#EDE9FE', borderRadius: 20, padding: '22px 26px', marginBottom: 16 }}>
              <SectionHeading>🎯 Для кого</SectionHeading>
              <p style={{ fontSize: 15, color: '#4B5563', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{program.who_its_for}</p>
            </div>
          )}

          {/* Career options */}
          {(program.career_options ?? []).length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SectionHeading>💼 Карьерные пути</SectionHeading>
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                {program.career_options.map((career, i) => (
                  <span
                    key={i}
                    style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: 14, fontWeight: 800, padding: '8px 16px', borderRadius: 9999 }}
                  >
                    {toDisplayString(career)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {Object.keys(program.requirements ?? {}).length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SectionHeading>📝 Требования</SectionHeading>
              <RequirementsTable data={program.requirements ?? {}} />
            </div>
          )}

          {/* Deadlines */}
          {Object.keys(program.deadlines ?? {}).length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <SectionHeading>🗓️ Дедлайны</SectionHeading>
              <DeadlinesGrid data={program.deadlines ?? {}} />
            </div>
          )}

          {/* Grants */}
          {(program.grants ?? []).length > 0 && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 20, padding: '20px 24px', marginBottom: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 30 }}>🎓</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#C2410C', marginBottom: 2 }}>Гранты и стипендии</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#9A3412' }}>
                  {program.grants.map(g => toDisplayString(g)).join(' · ')}
                </div>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ flex: 1, minWidth: 240, height: 58, border: 'none', borderRadius: 9999, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', fontSize: 17, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 10px 22px rgba(124,58,237,.3)' }}
            >
              🎓 Посмотреть университеты
            </button>
            <button
              onClick={() => navigate('/results')}
              style={{ flex: 1, minWidth: 200, height: 58, border: '1.5px solid #DDD6FE', borderRadius: 9999, background: '#fff', color: '#5B21B6', fontSize: 17, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Назад к результатам
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
