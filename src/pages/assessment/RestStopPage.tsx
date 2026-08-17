import { useNavigate, useLocation, useSearchParams } from 'react-router';
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
 * "Привал" (rest stop) — a mid-assessment interstitial that appears every
 * 10-12 RAW questions answered (see useAssessmentStore.recordQuestionAnswered),
 * independent of whether a question-block has closed. Visually the same card
 * family as PraisePage/ExitAssessmentModal/ResultLoadingPage (Paper card on
 * Fog background, hairline border via shadow-pop, Mascot, Spine progress),
 * but semantically different from PraisePage: PraisePage is a fact statement
 * with no question ("Молодец!" + "Дальше →" button); this always ends its
 * body copy on an invitation ("...Продолжаем?") and speaks only in
 * first-person-system voice ("замечаю"/"вижу"), never judging the student.
 *
 * Two content variants:
 *  - Normal — a micro-insight about the *process* of choosing, if one is
 *    available (`state.microInsight`), else the honest neutral fallback
 *    ("Прошли N, идём ровно") with NO insight claim. See `RestStopState`
 *    doc above for why a real insight is never available yet.
 *  - Speed-flag — ТЗ: shown once per test run when 15-35% of answers so far
 *    were "too fast". That detection needs real per-answer response-time
 *    data, which also doesn't exist anywhere in the API layer yet (checked
 *    SaveAnswersPayload/SubmitMotivationPayload/SubmitMotivationPairPayload —
 *    none carry a timestamp). So this variant is never triggered by real
 *    logic in production; it's fully built and reachable only via the
 *    `?variant=speed` query param, a QA/dev preview escape hatch, clearly
 *    not a production trigger path. Uses `welcome` mascot per spec, not `rest`.
 */
export default function RestStopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state ?? {}) as RestStopState;

  const returnTo = state.returnTo ?? '/assessment';
  const progress = state.progress ?? 0;
  const totalAnswered = state.totalAnswered ?? 0;

  // QA/dev-only preview of the speed-flag shell — see doc comment above for
  // why this can't be driven by a real signal yet.
  const isSpeedVariant = searchParams.get('variant') === 'speed';
  const hasInsight = !isSpeedVariant && Boolean(state.microInsight);

  function handleContinue() {
    navigate(returnTo, { replace: true });
  }

  function handlePause() {
    // Progress is already saved after every answer (same guarantee
    // ExitAssessmentModal relies on) — pausing is just leaving.
    navigate('/home');
  }

  const kicker = isSpeedVariant || hasInsight ? 'Замечаю по ходу' : 'Привал';
  const headline = isSpeedVariant
    ? 'Ты идёшь быстрее, чем успеваешь прочитать'
    : hasInsight
      ? state.microInsight!
      : `Прошли ${totalAnswered}, идём ровно`;
  const body = isSpeedVariant
    ? 'Этот тест никто не проверяет и никому не показывает — торопиться не нужно. Можно отдохнуть и вернуться к тому же вопросу, место сохранится.'
    : hasInsight
      ? 'Пока это только наблюдение — что оно значит, посчитаем в самом конце. Продолжаем?'
      : 'Отдохни секунду, если нужно, — вопросы никуда не убегут. Продолжаем?';

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

        <Spine value={progress} thickness={0.9} ariaLabel="Прогресс диагностики" />

        <div className="flex flex-col gap-2">
          {isSpeedVariant ? (
            <>
              <Button variant="primary" size="lg" className="w-full rounded-pill" onClick={handleContinue}>
                Продолжаем не спеша
              </Button>
              <Button variant="ghost" size="lg" className="w-full rounded-pill" onClick={handlePause}>
                Сделать паузу
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" className="w-full rounded-pill" onClick={handleContinue}>
              Продолжаем
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
