import { Navigate, useNavigate, useLocation, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Mascot } from '@/shared/ui/Mascot';
import { Spine } from '@/shared/ui/Spine';
import type { RestStopState } from './utils/restStop';

export type { RestStopState };

// RestStopState field notes:
//  - returnTo: route to resume at after "Продолжаем" — the flow that triggered the stop.
//  - progress: 0–100, current phase progress at the moment of the stop — feeds the Spine.
//  - totalAnswered: running count of raw questions answered so far this run — used for the
//    neutral-fallback headline ("Прошли N, идём ровно") when there's no real behavioral
//    signal to back an honest micro-insight.
//  - microInsight: a real, backend-sourced observation about *how* the student is choosing
//    (process, never RIASEC type/profession/verdict) — e.g. "склонен выбирать вариант,
//    который сложнее сразу проверить". Always undefined today: no endpoint in this
//    frontend's API layer currently returns any mid-assessment behavioral-pattern signal
//    (checked assessmentApi/pairsApi/motivationApi/motivationPairsApi response shapes —
//    none carry one). Left wired here rather than faked client-side, so a future real
//    signal only needs to be threaded into the `navigate(..., { state })` calls in the 4
//    assessment hooks, nothing here needs to change. Max one insight per stop is enforced
//    simply by this being a single optional field, not a list.

/**
 * "Привал" (rest stop) — a mid-assessment interstitial that appears at
 * 25/50/75% of the way through the whole run (see
 * useAssessmentStore.recordQuestionAnswered), independent of whether a
 * question-block has closed. Visually the same card
 * family as ExitAssessmentModal/ResultLoadingPage (Paper card on Fog
 * background, hairline border via shadow-pop, Mascot, Spine progress).
 *
 * Пришёл на смену экрану похвалы («Молодец!» + «Дальше →»), который был
 * простой констатацией факта и удалён в PRO-266 как недостижимый: этот
 * всегда заканчивает текст приглашением («...Продолжаем?») и говорит
 * только от лица системы («замечаю»/«вижу»), никогда не оценивая ученика.
 *
 * Two content variants:
 *  - Normal — a micro-insight about the *process* of choosing, if one is
 *    available (`state.microInsight`), else the honest neutral fallback
 *    ("Прошли N, идём ровно") with NO insight claim. See `RestStopState`
 *    doc above for why a real insight is never available yet.
 *  - Speed-flag — ТЗ: shown once per test run when 15-35% of answers so far
 *    were "too fast". Timed entirely client-side (no backend signal needed):
 *    each of the 4 assessment hooks measures ms-from-item-shown to
 *    ms-at-submit and reports it via useAssessmentStore.recordAnswerTiming,
 *    which flags this in `RestStopState.isSpeedFlag` the first time the
 *    run-wide ratio lands in that band. `?variant=speed` still works as a
 *    QA/dev preview that bypasses the real signal. Uses `welcome` mascot
 *    per spec, not `rest`.
 */
export default function RestStopPage() {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state ?? {}) as RestStopState;

  const returnTo = state.returnTo ?? '/assessment';
  const progress = state.progress ?? 0;
  const totalAnswered = state.totalAnswered ?? 0;

  // Real signal from useAssessmentStore.recordAnswerTiming, or the
  // `?variant=speed` QA/dev preview escape hatch — see doc comment above.
  const isSpeedVariant = state.isSpeedFlag === true || searchParams.get('variant') === 'speed';
  // Привал существует только внутри прохождения: и прогресс, и адрес
  // возврата приходят в состоянии перехода. По прямой ссылке экран
  // показывал «Прошли 0, идём ровно» человеку вне теста. `?variant=speed`
  // остаётся рабочей превьюшкой для QA — см. комментарий выше.
  const openedOutOfFlow = location.state == null && searchParams.get('variant') === null;
  const hasInsight = !isSpeedVariant && Boolean(state.microInsight);

  function handleContinue() {
    navigate(returnTo, { replace: true });
  }

  function handlePause() {
    // Progress is already saved after every answer (same guarantee
    // ExitAssessmentModal relies on) — pausing is just leaving.
    navigate('/results');
  }

  if (openedOutOfFlow) return <Navigate to="/results" replace />;

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

  return (
    <div className="flex flex-col min-h-screen bg-page items-center justify-center px-6 py-10">
      <div
        className="w-full max-w-lg bg-surface rounded-[var(--radius-lg)] shadow-pop p-7 sm:p-8 flex flex-col gap-6"
        style={{ animation: 'fade-in-up 0.5s ease both' }}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <span className="font-mono text-tiny font-bold uppercase tracking-widest text-accent">
              {kicker}
            </span>
            <h1 className="text-h1 font-black text-primary">{headline}</h1>
            <p className="text-body text-secondary leading-relaxed">{body}</p>
          </div>
          <Mascot state={isSpeedVariant ? 'welcome' : 'rest'} size={96} className="shrink-0" />
        </div>

        <Spine value={progress} thickness={0.9} ariaLabel={t('restStop.progressAria')} />

        <div className="flex flex-col gap-2">
          {isSpeedVariant ? (
            <>
              <Button variant="primary" size="lg" className="w-full rounded-pill" onClick={handleContinue}>
                {t('restStop.continueSlow')}
              </Button>
              <Button variant="ghost" size="lg" className="w-full rounded-pill" onClick={handlePause}>
                {t('restStop.pause')}
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" className="w-full rounded-pill" onClick={handleContinue}>
              {t('restStop.continue')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
