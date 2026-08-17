import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
import { SubjectsGapSection } from '@/pages/roadmap/direction/components/SubjectsGapSection';
import type { StudentCareer } from '@/shared/types';
import { DirectionMatchList } from './DirectionMatchList';
import { RoadmapHorizons } from './RoadmapHorizons';

interface ScenarioCProps {
  careers: StudentCareer[];
  /** Onboarding grade (1–11) — used only to derive an admission-year estimate. */
  grade?: number | null;
  subjectsEasy: string[];
}

const ADMISSION_HORIZONS = [
  { id: 'h1', label: '1 МЕСЯЦ', title: 'Выбрать программы', description: 'Короткий список вузов и программ по направлению — из списка ниже.' },
  { id: 'h2', label: '3 МЕСЯЦА', title: 'Закрыть требования', description: 'Экзамены, языковые сертификаты, портфолио — по требованиям программ.' },
  { id: 'h3', label: '1 ГОД', title: 'Подать документы', description: 'Заявки в основные и резервные программы, дедлайны по каждой.' },
  { id: 'h4', label: 'ДО ПОСТУПЛЕНИЯ', title: 'Получить решение', description: 'Ответы от вузов, выбор из предложений, зачисление.' },
];

/**
 * Scenario C (university), full version — senior only. Step 02 reuses
 * UniversityListPage/ProgramDetailPage as-is: those already implement the
 * dense program table this step needs (filters, cards, requirements
 * detail), so this links into that existing route
 * (`/results/directions/:slug/universities`) rather than re-embedding the
 * table's markup here — same pattern CareerCard/DirectionDetailPage already
 * use for "Найти университеты".
 */
export function ScenarioC({ careers, grade, subjectsEasy }: ScenarioCProps) {
  const navigate = useNavigate();
  const sorted = useMemo(() => [...careers].sort((a, b) => a.rank - b.rank), [careers]);
  const top = sorted[0];

  // Admission-year estimate: derived from onboarding grade, assuming an
  // 11-grade system where grade 11 is the graduation/admission year — the
  // API has no explicit "admission year" field, so this is a computed
  // best-effort, omitted entirely (no fabricated year) when grade is
  // unknown.
  const admissionYear = useMemo(() => {
    if (!grade || grade < 1 || grade > 11) return null;
    return new Date().getFullYear() + Math.max(0, 11 - grade);
  }, [grade]);

  if (!top) {
    return <p className="text-body text-secondary">Пока недостаточно данных, чтобы предложить направление.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-start justify-between gap-4 flex-wrap bg-brand-subtle">
        <div>
          <span
            className="inline-block font-mono text-[11px] font-bold uppercase tracking-[.06em] text-brand bg-surface rounded-pill px-3 py-1 mb-2"
          >
            ПОСТУПИТЬ · {top.name}{admissionYear ? ` · ПРИЁМ ${admissionYear}` : ''}
          </span>
          <h2 className="text-title font-extrabold text-primary leading-snug">{top.name}</h2>
          <p className="text-body text-secondary leading-relaxed mt-1 max-w-2xl">{top.why}</p>
        </div>
        <CareerMatchLadder tier={top.tier} className="flex-shrink-0" />
      </Card>

      <section aria-label="Направления под цель">
        <h3 className="text-label font-bold text-primary mb-3 font-mono uppercase tracking-[.04em]">
          01 · НАПРАВЛЕНИЯ ПОД ЦЕЛЬ
        </h3>
        <DirectionMatchList careers={sorted} excludeSlugs={[top.slug]} />
      </section>

      <section aria-label="Программы и вузы">
        <h3 className="text-label font-bold text-primary mb-3 font-mono uppercase tracking-[.04em]">
          02 · ПРОГРАММЫ И ВУЗЫ
        </h3>
        <Card className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-body text-secondary max-w-md">
            Программы и университеты по направлению «{top.name}» — с фильтром по стране и требованиями по каждой программе.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(`/results/directions/${encodeURIComponent(top.slug)}/universities`)}
          >
            Смотреть программы и вузы →
          </Button>
        </Card>
      </section>

      <section aria-label="Предметы направления">
        <h3 className="text-label font-bold text-primary mb-3 font-mono uppercase tracking-[.04em]">
          03 · ПРЕДМЕТЫ НАПРАВЛЕНИЯ
        </h3>
        <SubjectsGapSection subjects={top.subjects_to_develop} subjectsEasy={subjectsEasy} />
      </section>

      <section aria-label="Roadmap поступления">
        <RoadmapHorizons
          title="04 · ROADMAP ПОСТУПЛЕНИЯ"
          horizons={ADMISSION_HORIZONS}
          ariaLabel="Roadmap поступления: 1 месяц, 3 месяца, 1 год, до поступления"
          lastNodeStyle="filled"
        />
      </section>
    </div>
  );
}
