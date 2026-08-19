import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/typography/Heading';
import { CareerMatchLadder, careerTierToLevel } from '@/shared/ui/MatchLadder';
import type { AgeGroup, StudentCareer } from '@/shared/types';
import { DirectionMatchList } from './DirectionMatchList';
import { RoadmapHorizons } from './RoadmapHorizons';

interface ScenarioProfessionalProps {
  careers: StudentCareer[];
  /** 'middle' | 'senior' only — junior never reaches this scenario. */
  ageGroup: AgeGroup;
  /** Onboarding grade (1–11) — used only to derive an admission-year estimate, senior only. */
  grade?: number | null;
}

// "ROADMAP ВЫБОРА" — middle tier: still narrowing down a direction, not yet
// admission-specific (matches ScenarioCDowngrade's original reasoning that
// the subject profile isn't locked in at 12–14).
const CHOICE_HORIZONS = [
  { id: 'h1', label: '1 МЕСЯЦ', title: 'Проверить направление на практике', description: 'Мини-проект, стажировка на день, разговор с кем-то из профессии.' },
  { id: 'h2', label: '3 МЕСЯЦА', title: 'Сузить до 1–2 вариантов', description: 'Сравнить, что реально понравилось делать, а не только звучало интересно.' },
  { id: 'h3', label: '6 МЕСЯЦЕВ', title: 'Принять решение', description: 'Выбрать направление и спланировать следующие конкретные шаги.' },
];

// "ROADMAP ПОСТУПЛЕНИЯ" — senior only: admission is close enough to plan concretely.
const ADMISSION_HORIZONS = [
  { id: 'h1', label: '1 МЕСЯЦ', title: 'Выбрать программы', description: 'Короткий список вузов и программ по направлению — из списка ниже.' },
  { id: 'h2', label: '3 МЕСЯЦА', title: 'Закрыть требования', description: 'Экзамены, языковые сертификаты, портфолио — по требованиям программ.' },
  { id: 'h3', label: '1 ГОД', title: 'Подать документы', description: 'Заявки в основные и резервные программы, дедлайны по каждой.' },
  { id: 'h4', label: 'ДО ПОСТУПЛЕНИЯ', title: 'Получить решение', description: 'Ответы от вузов, выбор из предложений, зачисление.' },
];

/**
 * Merged "профессия + университет" scenario — `profession` and
 * `university` used to be two separate assessment goals with two separate
 * scenario trees (ScenarioB/ScenarioC/ScenarioCDowngrade); they're one goal
 * now (GoalSelectionPage only offers "Выбрать профессию"), so this is one
 * component. What used to be goal-gated (admission year, roadmap flavor) is
 * now purely age-gated: senior gets the full admission-oriented roadmap,
 * middle gets the lighter exploration one — same reasoning
 * ScenarioCDowngrade already had (subject profile isn't locked in yet at
 * 12–14), just no longer tied to a second goal choice. University/program
 * access itself lives inline on the direction detail page (gated by
 * `canSeeUniversities` via `useUniversityList`), not duplicated here.
 *
 * Which direction is treated as "the goal" is a judgment call: the
 * result-v2 contract has no field for a specific stated-target
 * profession/university, only the assessment goal category — so the
 * top-ranked entry in `report.careers` (rank 1, already the backend's own
 * best match) stands in for "the goal direction". Load-bearing for every
 * headline/copy string below.
 */
export function ScenarioProfessional({ careers, ageGroup, grade }: ScenarioProfessionalProps) {
  const navigate = useNavigate();
  const isMiddle = ageGroup === 'middle';
  const sorted = useMemo(() => [...careers].sort((a, b) => a.rank - b.rank), [careers]);
  const top = sorted[0];

  // Admission-year estimate: derived from onboarding grade, assuming an
  // 11-grade system where grade 11 is the graduation/admission year — the
  // API has no explicit "admission year" field, so this is a computed
  // best-effort, omitted entirely (no fabricated year) when grade is
  // unknown. Senior only — at middle tier there's nothing concrete to date yet.
  const admissionYear = useMemo(() => {
    if (isMiddle || !grade || grade < 1 || grade > 11) return null;
    return new Date().getFullYear() + Math.max(0, 11 - grade);
  }, [isMiddle, grade]);

  if (!top) {
    return <p className="text-body text-secondary">Пока недостаточно данных, чтобы предложить направление.</p>;
  }

  const level = careerTierToLevel(top.tier);
  const isBridge = level <= 2;

  // "Adjacent directions that share the same strength" — real data: other
  // careers in the list whose matched_strengths overlap with the top
  // direction's, not a fabricated relation.
  const adjacent = sorted
    .slice(1)
    .filter((c) => c.matched_strengths.some((s) => top.matched_strengths.includes(s)))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {admissionYear && (
          <span className="inline-block w-fit font-mono text-mono-xs font-bold uppercase tracking-label text-brand bg-brand-subtle rounded-pill px-3 py-1">
            ПРИЁМ {admissionYear}
          </span>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Heading level="display-md" as="h2" className="text-[color:var(--midnight)] flex-1 min-w-0">
            {isBridge
              ? <>«{top.name}» совпадает одной стороной — и эта сторона сильная</>
              : <>«{top.name}» хорошо совпадает с тем, что видно в профиле</>}
          </Heading>
          <CareerMatchLadder tier={top.tier} className="flex-shrink-0" />
        </div>
        <p className="text-body text-primary leading-relaxed max-w-2xl">{top.why}</p>
        {isBridge && (
          <p className="text-caption leading-snug max-w-2xl" style={{ color: 'var(--ink)' }}>
            Цель не понижается и не отмечается как «не подходит» — она остаётся заявленной целью.
          </p>
        )}
        <div className="border-t border-[var(--hairline)]" />
      </div>

      {isBridge && (
        <Card style={{ borderColor: 'var(--lake)', background: 'color-mix(in srgb, var(--lake) 6%, transparent)' }}>
          <div className="mb-4">
            <p className="text-label font-bold text-primary flex items-center gap-2">
              <span aria-hidden="true">🌉</span>
              МОСТ К ЦЕЛИ
            </p>
            <p className="text-caption text-secondary leading-snug mt-1">
              Ни Глины, ни отказа: расхождение — это задача, а не приговор.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--pine)' }}
              >
                УЖЕ РАБОТАЕТ В ПОЛЬЗУ ЦЕЛИ
              </p>
              <ul className="flex flex-col gap-1.5">
                {(top.matched_strengths.length > 0 ? top.matched_strengths.slice(0, 3) : ['Есть база для старта — см. «Почему подходит»']).map((s, i) => (
                  <li key={i} className="text-caption text-primary leading-snug">— {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--dawn)' }}
              >
                ПРОВЕРИТЬ ДЕЙСТВИЕМ
              </p>
              <ul className="flex flex-col gap-1.5">
                <li className="text-caption text-primary leading-snug">— {top.try_now}</li>
                <li className="text-caption text-primary leading-snug">— Поговорить с кем-то, кто уже в этой сфере</li>
              </ul>
            </div>
            <div>
              <p
                className="text-tiny font-mono font-bold uppercase tracking-label mb-2"
                style={{ color: 'var(--lake)' }}
              >
                РЯДОМ С ЦЕЛЬЮ · ТА ЖЕ СИЛЬНАЯ СТОРОНА
              </p>
              {adjacent.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {adjacent.map((c) => (
                    <li key={c.slug} className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/results/directions/${encodeURIComponent(c.slug)}`)}
                        className="text-caption font-semibold text-primary hover:text-brand text-left"
                      >
                        {c.name}
                      </button>
                      <CareerMatchLadder tier={c.tier} showLabel={false} size="sm" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-caption text-muted">Пока нет других направлений с той же сильной стороной.</p>
              )}
              <p className="text-tiny text-muted leading-snug mt-2">Не замена цели — просто рядом.</p>
            </div>
          </div>
        </Card>
      )}

      <section aria-label="Направления и профессии под цель">
        <h3 className="text-label font-bold text-primary mb-3 font-mono uppercase tracking-label">
          {isMiddle ? 'НАПРАВЛЕНИЯ И ПРОФЕССИИ ПОД ЦЕЛЬ' : '01 · НАПРАВЛЕНИЯ ПОД ЦЕЛЬ'}
        </h3>
        <DirectionMatchList careers={sorted} />
      </section>

      <RoadmapHorizons
        title={isMiddle ? 'ROADMAP ВЫБОРА' : '02 · ПУТЬ ДО ПОСТУПЛЕНИЯ'}
        horizons={isMiddle ? CHOICE_HORIZONS : ADMISSION_HORIZONS}
        ariaLabel={isMiddle
          ? 'Roadmap выбора профессии: 1 месяц, 3 месяца, 6 месяцев до решения'
          : 'Путь до поступления: 1 месяц, 3 месяца, 1 год, до поступления'}
        lastNodeStyle="filled"
      />
    </div>
  );
}
