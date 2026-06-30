import { useNavigate } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toDisplayString, formatCost, localizeKey } from '@/pages/results/utils/programUtils';
import { useProgramDetail } from '@/pages/results/hooks/useProgramDetail';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProgramDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

// ── Key-value table (requirements / deadlines) ────────────────────────────────

function KVTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <Card className="!p-0 overflow-hidden divide-y divide-default">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="text-caption text-secondary flex-1">{localizeKey(key)}</span>
          <span className="text-caption text-primary text-right flex-1">{toDisplayString(value)}</span>
        </div>
      ))}
    </Card>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ icon, children }: { icon: string; children: string }) {
  return (
    <h2 className="text-label font-bold text-primary flex items-center gap-2 mb-3">
      <span aria-hidden="true">{icon}</span>
      {children}
    </h2>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { program, isLoading, error, assessmentId, handleCheckChances } = useProgramDetail();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Nav */}
      <div className="mb-6">
        <button
          className="flex items-center gap-1.5 text-brand font-semibold text-label hover:opacity-70 transition-opacity"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      {isLoading ? (
        <ProgramDetailSkeleton />
      ) : error !== null || !program ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error ?? 'Программа не найдена'}</p>
          <Button variant="ghost" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <h1 className="text-h1 font-extrabold text-primary mb-1">{program.name}</h1>
            <p className="text-body text-secondary">{program.university.name}</p>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">🌐 {program.language}</Badge>
            <Badge variant="default">💰 {formatCost(program.cost_per_year)}</Badge>
          </div>

          {/* Description */}
          {program.description && program.description.length > 0 && (
            <div>
              <SectionHeading icon="📋">Описание</SectionHeading>
              <p className="text-body text-secondary leading-relaxed">{program.description}</p>
            </div>
          )}

          {/* Who it's for */}
          {program.who_its_for && program.who_its_for.length > 0 && (
            <div>
              <SectionHeading icon="🎯">Для кого</SectionHeading>
              <Card className="bg-brand-subtle">
                <p className="text-body text-primary leading-relaxed">{program.who_its_for}</p>
              </Card>
            </div>
          )}

          {/* Career options */}
          {(program.career_options ?? []).length > 0 && (
            <div>
              <SectionHeading icon="💼">Карьерные пути</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {program.career_options.map((career, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-pill text-caption font-semibold bg-brand-subtle text-brand border border-default"
                  >
                    {toDisplayString(career)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {Object.keys(program.requirements ?? {}).length > 0 && (
            <div>
              <SectionHeading icon="📝">Требования</SectionHeading>
              <KVTable data={program.requirements ?? {}} />
            </div>
          )}

          {/* Deadlines */}
          {Object.keys(program.deadlines ?? {}).length > 0 && (
            <div>
              <SectionHeading icon="📅">Дедлайны</SectionHeading>
              <KVTable data={program.deadlines ?? {}} />
            </div>
          )}

          {/* Grants */}
          {(program.grants ?? []).length > 0 && (
            <div>
              <SectionHeading icon="🎓">Гранты и стипендии</SectionHeading>
              <ul className="flex flex-col gap-2">
                {program.grants.map((grant, i) => (
                  <li key={i} className="flex items-start gap-2 text-body text-secondary">
                    <span className="text-brand font-bold mt-0.5 flex-shrink-0">•</span>
                    {toDisplayString(grant)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          {/* ЗАКОМЕНТИРОВАНО ПЕРЕД ДЕПЛОЕМ НЕДОСТУПНО
            НУЖНО БУДЕТ В БУДУЩЕМ ВОЗОБНОВИТЬ
          /*}
          {/* <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              className="w-full gap-2"
              disabled={!assessmentId}
              onClick={handleCheckChances}
            >
              <Search className="w-5 h-5" />
              Проверить мои шансы
            </Button>
            {!assessmentId && (
              <p className="text-caption text-muted text-center mt-2">
                Пройди диагностику, чтобы проверить свои шансы
              </p>
            )}
          </div> */}
        </div>
      )}
    </div>
  );
}
