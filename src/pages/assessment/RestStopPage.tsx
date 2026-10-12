import { Navigate, useNavigate, useLocation, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Pause } from 'lucide-react';
import { JourneyCheckpoint } from '@/shared/ui';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Text } from '@/shared/ui/typography/Text';
import { ASSESSMENT_PHASE_MINUTES } from '@/shared/config/constants';
import type { JourneyStage } from '@/shared/lib/journeyProgress';
import type { RestStopState } from './utils/restStop';

export type { RestStopState };

// RestStopState field notes:
//  - returnTo: route to resume at after "Продолжаем" — the flow that triggered the stop.
//  - stages: per-phase progress at the moment of the stop — feeds the stage map
//    (Диагностика · Мотивация · Команда · Учебные задачи).
//  - totalAnswered: running count of raw questions answered so far this run — used for the
//    neutral-fallback headline ("Позади N вопросов") when there's no real behavioral
//    signal to back an honest micro-insight.
//  - microInsight: a real, backend-sourced observation about *how* the student is choosing
//    (process, never RIASEC type/profession/verdict) — e.g. "склонен выбирать вариант,
//    который сложнее сразу проверить". Always undefined today: no endpoint in this
//    frontend's API layer currently returns any mid-assessment behavioral-pattern signal
//    (checked assessmentApi/pairsApi/motivationApi response shapes —
//    none carry one). Left wired here rather than faked client-side, so a future real
//    signal only needs to be threaded into the `navigate(..., { state })` calls in the 2
//    assessment hooks, nothing here needs to change. Max one insight per stop is enforced
//    simply by this being a single optional field, not a list.

/**
 * "Привал" (rest stop) — a mid-assessment interstitial that appears at
 * 25/50/75% of the way through the whole run (see
 * useAssessmentStore.recordQuestionAnswered), independent of whether a
 * question-block has closed. Uses the shared JourneyCheckpoint layout,
 * a transparent mascot, and the existing Spine progress.
 *
 * Пришёл на смену экрану похвалы («Молодец!» + «Дальше →»), который был
 * простой констатацией факта и удалён в PRO-266 как недостижимый: этот
 * всегда заканчивает текст приглашением («...Продолжаем?») и говорит
 * только от лица системы («замечаю»/«вижу»), никогда не оценивая ученика.
 *
 * Two content variants:
 *  - Normal — a micro-insight about the *process* of choosing, if one is
 *    available (`state.microInsight`), else the honest neutral fallback
 *    ("Позади N вопросов") with NO insight claim. See `RestStopState`
 *    doc above for why a real insight is never available yet.
 *  - Speed-flag — ТЗ: shown once per test run when 15-35% of answers so far
 *    were "too fast". Timed entirely client-side (no backend signal needed):
 *    each of the 4 assessment hooks measures ms-from-item-shown to
 *    ms-at-submit and reports it via useAssessmentStore.recordAnswerTiming,
 *    which flags this in `RestStopState.isSpeedFlag` the first time the
 *    run-wide ratio lands in that band. `?variant=speed` still works as a
 *    QA/dev preview that bypasses the real signal. Uses `welcome` mascot
 *    per spec, not `rest`.
 *
 * Progress keeps the journey line but marks where each of the four phases
 * starts: a bare line at ~10% mostly shows how much is left, while
 * "first of four, a quarter in" reads as headway.
 */

/**
 * The old continuous line (solid → orange "you are here" → dotted → goal)
 * with a milestone at the start of each phase. Phases get equal quarters
 * rather than time-weighted spans: by minutes Мотивация and Команда start
 * 6% apart and their labels collide.
 */
function stageSpineNodes(
  stages: JourneyStage[],
  currentStage: JourneyStage | undefined,
  label: (id: JourneyStage['id']) => string,
  remaining: (stage: JourneyStage) => string,
): SpineNode[] {
  const span = 100 / stages.length;
  const currentIndex = currentStage ? stages.indexOf(currentStage) : stages.length;
  const nodes: SpineNode[] = [];

  stages.forEach((stage, i) => {
    const reached = i <= currentIndex;
    nodes.push({
      id: stage.id,
      position: i * span,
      status: reached ? 'done' : 'upcoming',
      segment: reached ? undefined : 'dashed',
      label: label(stage.id),
      labelColor: stage === currentStage ? 'var(--text-heading)' : undefined,
      description: stage === currentStage ? remaining(stage) : undefined,
    });
    if (stage === currentStage) {
      nodes.push({ id: 'current', position: (i + stage.fraction) * span, status: 'current' });
    }
  });

  nodes.push({
    id: 'goal',
    position: 100,
    status: currentStage ? 'upcoming' : 'done',
    goal: true,
    segment: currentStage ? 'dashed' : undefined,
  });
  return nodes;
}

/** Minutes left in the current phase — whole minutes under 10, then to the nearest 5. */
function remainingMinutes(stage: JourneyStage): number {
  const minutes = (1 - stage.fraction) * ASSESSMENT_PHASE_MINUTES[stage.id];
  return minutes >= 10 ? Math.round(minutes / 5) * 5 : Math.max(1, Math.round(minutes));
}
export default function RestStopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state ?? {}) as RestStopState;

  const returnTo = state.returnTo ?? '/assessment';
  // `?? []`: the speed preview opened by URL has no transition state.
  const stages = state.stages ?? [];
  // Real signal from useAssessmentStore.recordAnswerTiming, or the
  // `?variant=speed` QA/dev preview escape hatch — see doc comment above.
  const isSpeedVariant = state.isSpeedFlag === true || searchParams.get('variant') === 'speed';
  // Привал существует только внутри прохождения: и прогресс, и адрес
  // возврата приходят в состоянии перехода. По прямой ссылке экран
  // показывал «Прошли 0, идём ровно» человеку вне теста. `?variant=speed`
  // остаётся рабочей превьюшкой для QA — см. комментарий выше.
  const openedOutOfFlow = location.state == null && searchParams.get('variant') === null;

  function handleContinue() {
    navigate(returnTo, { replace: true });
  }

  function handlePause() {
    // Progress is already saved after every answer (same guarantee
    // ExitAssessmentModal relies on) — pausing is just leaving.
    navigate('/results');
  }

  if (openedOutOfFlow) return <Navigate to="/results" replace />;

  return <RestStopView state={{ ...state, stages }} isSpeedVariant={isSpeedVariant} onContinue={handleContinue} onPause={handlePause} />;
}

export function RestStopView({ state, isSpeedVariant = false, onContinue, onPause }: {
  state: RestStopState; isSpeedVariant?: boolean; onContinue: () => void; onPause: () => void;
}) {
  const { t } = useTranslation('assessment');
  const stages = state.stages ?? [];
  const hasInsight = !isSpeedVariant && Boolean(state.microInsight);
  const currentStage = stages.find((stage) => stage.fraction < 1);
  const totalAnswered = state.totalAnswered ?? 0;
  const spineNodes = stageSpineNodes(
    stages,
    currentStage,
    (id) => t(`restStop.stage.${id}`),
    (stage) => t('restStop.stageRemaining', { count: remainingMinutes(stage) }),
  );

  const kicker = isSpeedVariant || hasInsight ? t('restStop.kickerInsight') : t('restStop.kickerRest');
  const headline = isSpeedVariant
    ? t('restStop.speedHeadline')
    : hasInsight
      ? state.microInsight!
      : t('restStop.neutralHeadline', { count: totalAnswered });
  const body = isSpeedVariant
    ? t('restStop.speedBody')
    : hasInsight
      ? t('restStop.insightBody')
      : t('restStop.neutralBody');

  return <JourneyCheckpoint kicker={kicker} title={headline} body={body}
    illustration={isSpeedVariant ? 'greeting' : 'rest'}
    actions={<>
      <button type="button" className="rd-button rd-button-outline" onClick={onPause}><Pause size={17} aria-hidden="true" />{t('restStop.pause')}</button>
      <button type="button" className="rd-button" onClick={onContinue}>{t(isSpeedVariant ? 'restStop.continueSlow' : 'restStop.continue')}<ArrowRight size={17} aria-hidden="true" /></button>
    </>}>
        {stages.length > 0 && (
          <div className="rd-checkpoint-progress flex flex-col gap-3">
            {/* Labels under four milestones don't fit on a phone — there the
                line goes bare and the current stage is named on its own line. */}
            <Spine nodes={spineNodes} thickness={0.9} showLabels ariaLabel={t('restStop.progressAria')} className="hidden sm:block" />
            <Spine nodes={spineNodes} thickness={0.9} ariaLabel={t('restStop.progressAria')} className="sm:hidden" />
            {currentStage && (
              <Text variant="caption" className="sm:hidden m-0 text-muted">
                <span className="font-bold text-primary">{t(`restStop.stage.${currentStage.id}`)}</span>
                {' · '}
                {t('restStop.stageRemaining', { count: remainingMinutes(currentStage) })}
              </Text>
            )}
          </div>
        )}

  </JourneyCheckpoint>;
}
