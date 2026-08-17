import { useNavigate } from 'react-router';
import { Map, GraduationCap, Compass } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/config/constants';
import { useGoalContext } from '../hooks/useGoalContext';
import { useChangeGoal } from '@/shared/hooks/useChangeGoal';
import type { AssessmentGoal, GoalAlignmentBlock, ScenarioAData, ScenarioBData, ScenarioCData } from '@/shared/types';

const ALIGNMENT_LABELS: Record<GoalAlignmentBlock['alignment'], string> = {
  match: 'Отлично подходит',
  partial: 'Частично подходит',
  bridge: 'Понадобится доразвить',
  not_applicable: '',
};

const ALIGNMENT_STYLES: Record<GoalAlignmentBlock['alignment'], string> = {
  match: 'text-success bg-[#F0FDF4]',
  partial: 'text-warning bg-[#FFFBEB]',
  bridge: 'text-danger bg-[#FEF2F2]',
  not_applicable: '',
};

function AlignmentBadge({ block }: { block: GoalAlignmentBlock }) {
  if (block.alignment === 'not_applicable') return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            'font-extrabold rounded-pill px-3 py-1',
            ALIGNMENT_STYLES[block.alignment],
          )}
          style={{ fontSize: 11.5 }}
        >
          {ALIGNMENT_LABELS[block.alignment]}
        </span>
        {block.target_name && (
          <span className="font-extrabold text-primary text-body">{block.target_name}</span>
        )}
      </div>
      {block.match_explanation && (
        <p className="text-caption text-secondary leading-snug">{block.match_explanation}</p>
      )}
      {block.bridge_scenario && block.alignment === 'bridge' && (
        <div className="flex flex-col gap-2 mt-1">
          {block.bridge_scenario.what_works.length > 0 && (
            <div>
              <p className="text-caption font-bold text-primary mb-1">Что уже работает на тебя</p>
              <ul className="flex flex-col gap-1">
                {block.bridge_scenario.what_works.map((item, i) => (
                  <li key={i} className="text-caption text-secondary leading-snug">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {block.bridge_scenario.what_to_check.length > 0 && (
            <div>
              <p className="text-caption font-bold text-primary mb-1">Что стоит проверить</p>
              <ul className="flex flex-col gap-1">
                {block.bridge_scenario.what_to_check.map((item, i) => (
                  <li key={i} className="text-caption text-secondary leading-snug">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {block.adjacent_directions.length > 0 && (
        <p className="text-caption text-secondary">
          Смежные направления: {block.adjacent_directions.join(', ')}
        </p>
      )}
    </div>
  );
}

export interface GoalOverlaySectionProps {
  topCareerSlug: string | null;
}

export function GoalOverlaySection({ topCareerSlug }: GoalOverlaySectionProps) {
  const navigate = useNavigate();
  const { data: overlay, isLoading, isError } = useGoalContext();
  const { availableGoals, isPending: isChangingGoal, handleSelectGoal } = useChangeGoal();

  if (isLoading) {
    return (
      <section aria-label="Фокус под твою цель">
        <SectionHeading emoji="🧭" title="Фокус под твою цель" />
        <Card className="flex flex-col gap-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      </section>
    );
  }

  if (isError || !overlay) return null;

  if (overlay.needs_goal_selection) {
    return (
      <section aria-label="Фокус под твою цель">
        <SectionHeading emoji="🧭" title="С чего начнём?" />
        <Card className="flex flex-col gap-4">
          <p className="text-body text-secondary leading-relaxed">
            Ты выбрал(а) «Пока не знаю» — выбери, что для тебя сейчас важнее, и мы соберём рекомендации под это.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {overlay.suggested_goals.map((goal: AssessmentGoal) => (
              <Button
                key={goal}
                variant="primary"
                size="md"
                className="flex-1"
                disabled={isChangingGoal || !availableGoals.includes(goal)}
                onClick={() => handleSelectGoal(goal)}
              >
                {ASSESSMENT_GOAL_LABELS[goal]}
              </Button>
            ))}
          </div>
        </Card>
      </section>
    );
  }

  const scenarioA: ScenarioAData | null =
    overlay.scenario === 'A' && overlay.overlay_data && 'roadmap_summary' in overlay.overlay_data
      ? overlay.overlay_data
      : null;
  const scenarioB: ScenarioBData | null =
    overlay.scenario === 'B' && overlay.overlay_data && 'top_directions' in overlay.overlay_data
      ? overlay.overlay_data
      : null;
  const scenarioC: ScenarioCData | null =
    overlay.scenario === 'C' && overlay.overlay_data && 'gap_analysis' in overlay.overlay_data
      ? overlay.overlay_data
      : null;

  return (
    <section aria-label="Фокус под твою цель">
      <SectionHeading emoji="🧭" title="Фокус под твою цель" />
      <Card className="flex flex-col gap-4">
        {overlay.admission_info_note && (
          <p className="text-caption text-secondary bg-brand-subtle rounded-[var(--radius)] p-3">
            {overlay.admission_info_note}
          </p>
        )}

        {scenarioA && (
          <>
            {scenarioA.top_spheres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {scenarioA.top_spheres.map((sphere, i) => (
                  <span
                    key={i}
                    className="font-extrabold text-brand bg-brand-subtle rounded-pill px-3 py-1"
                    style={{ fontSize: 11.5 }}
                  >
                    {sphere}
                  </span>
                ))}
              </div>
            )}
            <p className="text-body text-secondary leading-relaxed">{scenarioA.roadmap_summary}</p>
            <Button variant="primary" size="md" className="self-start gap-2" onClick={() => navigate('/roadmap')}>
              <Map className="w-4 h-4" />
              Открыть план развития
            </Button>
          </>
        )}

        {scenarioB && (
          <>
            {scenarioB.top_directions.length > 0 && (
              <p className="text-body text-secondary leading-relaxed">
                Ближе всего тебе: {scenarioB.top_directions.join(', ')}.
              </p>
            )}
            {overlay.alignment_block?.target_selected ? (
              <AlignmentBadge block={overlay.alignment_block} />
            ) : (
              <p className="text-caption text-secondary leading-relaxed">
                Открой карточку направления ниже, чтобы построить план развития.
              </p>
            )}
          </>
        )}

        {scenarioC && (
          scenarioC.selected_program_name ? (
            <>
              <div>
                <p className="font-extrabold text-primary text-body">{scenarioC.selected_program_name}</p>
                {scenarioC.selected_university_name && (
                  <p className="text-caption text-secondary">{scenarioC.selected_university_name}</p>
                )}
              </div>
              {scenarioC.gap_analysis && (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-caption font-bold text-success">
                    ✓ Готово: {scenarioC.gap_analysis.met.length}
                  </span>
                  <span className="text-caption font-bold text-warning">
                    ◌ В процессе: {scenarioC.gap_analysis.in_progress.length}
                  </span>
                  <span className="text-caption font-bold text-danger">
                    ✗ Нужно развить: {scenarioC.gap_analysis.not_met.length}
                  </span>
                </div>
              )}
              {overlay.alignment_block && <AlignmentBadge block={overlay.alignment_block} />}
              <div className="flex flex-col sm:flex-row gap-2">
                {scenarioC.selected_program_id && (
                  <Button
                    variant="ghost"
                    size="md"
                    className="gap-2"
                    onClick={() => navigate(
                      // slug segment is a placeholder — GapAnalysisPage reads only :programId, see useGapAnalysis.ts
                      `/results/directions/program/universities/${scenarioC.selected_program_id}/gap`,
                      {
                        state: {
                          programName: scenarioC.selected_program_name,
                          universityName: scenarioC.selected_university_name,
                        },
                      },
                    )}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Подробный анализ готовности
                  </Button>
                )}
                <Button variant="primary" size="md" className="gap-2" onClick={() => navigate('/roadmap')}>
                  <Map className="w-4 h-4" />
                  План поступления
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-body text-secondary leading-relaxed">
                Выбери программу, чтобы увидеть, насколько ты готов(а) к поступлению.
              </p>
              {topCareerSlug && (
                <Button
                  variant="primary"
                  size="md"
                  className="self-start gap-2"
                  onClick={() => navigate(`/results/directions/${encodeURIComponent(topCareerSlug)}/universities`)}
                >
                  <Compass className="w-4 h-4" />
                  Подобрать вуз
                </Button>
              )}
            </>
          )
        )}
      </Card>
    </section>
  );
}
