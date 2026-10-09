import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ChevronDown, SkipForward, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Text } from '@/shared/ui/typography/Text';
import type {
  AsturAnalogyItem,
  AsturAwarenessItem,
  AsturClassificationItem,
  AsturContentSubtest,
  AsturFigureAssemblyItem,
  AsturGeneralizationItem,
  AsturItemAnswer,
  AsturLogicalSchemaItem,
  AsturNumericSeriesItem,
} from '@/shared/types';
import { AssessmentTimer, formatCountdownMmSs } from '../../components/AssessmentTimer';
import { useCountdown, type CountdownClockSync } from '../hooks/useCountdown';
import {
  type AsturAnswerState,
  areAllAsturItemsDone,
  buildAsturAnswerPayload,
  countAsturSkipped,
  isAsturItemDone,
} from '../utils/asturAnswersComplete';
import { McQuestion } from './McQuestion';
import { PickTwoQuestion } from './PickTwoQuestion';
import { OpenTextQuestion } from './OpenTextQuestion';
import { NumericPairQuestion } from './NumericPairQuestion';
import { HierarchyDragQuestion } from './HierarchyDragQuestion';
import { FigureAssemblyQuestion } from './FigureAssemblyQuestion';

/** Most subtests keep the same page size as the main Likert battery
 * (`buildPages` LIKERT_PAGE_SIZE) — PRO-399. Geometry is deliberately one
 * item per page: its target and four spatial options need the whole viewport
 * to stay large and visible together without horizontal scrolling. */
const DEFAULT_PAGE_SIZE = 5;
const GEOMETRY_PAGE_SIZE = 1;

function pageSizeFor(subtest: AsturContentSubtest): number {
  return subtest.key === 'geometric_figures' ? GEOMETRY_PAGE_SIZE : DEFAULT_PAGE_SIZE;
}

interface SubtestRunnerProps {
  subtest: AsturContentSubtest;
  startedAt: string | null;
  serverClock: CountdownClockSync | null;
  /** AssessmentRail's status slot — the countdown renders up there. */
  timerSlot: HTMLElement | null;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (payload: { answers: Record<string, AsturItemAnswer> }) => void;
}

/** An item as served, before the student touches it. */
function blankValue(subtest: AsturContentSubtest, item: AsturContentSubtest['items'][number]): unknown {
  if (subtest.key === 'classification') return [] as string[];
  if (subtest.key === 'numeric_series') return ['', ''] as [string, string];
  if (subtest.key === 'logical_schemas') return [...(item as AsturLogicalSchemaItem).concepts];
  return '';
}

function initialState(subtest: AsturContentSubtest): AsturAnswerState {
  const values = Object.fromEntries(subtest.items.map((item, i) => [String(i + 1), blankValue(subtest, item)]));
  return { values, skipped: new Set(), touched: new Set() };
}

function renderItem(
  subtest: AsturContentSubtest,
  item: AsturContentSubtest['items'][number],
  absoluteIndex: number,
  state: AsturAnswerState,
  setAnswer: (index: string, value: unknown) => void,
  t: TFunction<'assessment'>,
) {
  const index = String(absoluteIndex + 1);
  const displayIndex = absoluteIndex + 1;
  const value = state.values[index];

  switch (subtest.key) {
    case 'awareness': {
      const it = item as AsturAwarenessItem;
      return (
        <McQuestion index={displayIndex} prompt={it.text} options={it.options}
          value={value as string | undefined} onChange={(v) => setAnswer(index, v)} />
      );
    }
    case 'analogies': {
      const it = item as AsturAnalogyItem;
      return (
        <McQuestion index={displayIndex}
          prompt={t('astur.analogyPrompt', { first: it.pair[0], second: it.pair[1], third: it.third })}
          options={it.options} value={value as string | undefined} onChange={(v) => setAnswer(index, v)} />
      );
    }
    case 'classification': {
      const it = item as AsturClassificationItem;
      return (
        <PickTwoQuestion index={displayIndex} words={it.words}
          value={value as string[]} onChange={(v) => setAnswer(index, v)} />
      );
    }
    case 'generalization': {
      const it = item as AsturGeneralizationItem;
      return (
        <OpenTextQuestion index={displayIndex} pair={it.pair}
          value={value as string} onChange={(v) => setAnswer(index, v)} />
      );
    }
    case 'numeric_series': {
      const it = item as AsturNumericSeriesItem;
      return (
        <NumericPairQuestion index={displayIndex} sequence={it.sequence}
          value={value as [string, string]} onChange={(v) => setAnswer(index, v)} />
      );
    }
    case 'geometric_figures': {
      const it = item as AsturFigureAssemblyItem;
      return (
        <FigureAssemblyQuestion index={displayIndex} stimulus={it.stimulus}
          value={value as string | undefined} onChange={(v) => setAnswer(index, v)} />
      );
    }
    default:
      return (
        <HierarchyDragQuestion index={displayIndex} value={value as string[]}
          served={(item as AsturLogicalSchemaItem).concepts}
          confirmed={state.touched.has(index)} onChange={(v) => setAnswer(index, v)} />
      );
  }
}

/**
 * One (non-lability) ASTUR subtest: ordinary items are shown five per page,
 * while spatial geometry uses one item per page. There is still one timer
 * for the whole subtest. Every item is either answered or
 * explicitly skipped (PRO-427 §11) — «Далее» unlocks once each item on the
 * page is one of the two (PRO-400), and sending a subtest with skips asks
 * for confirmation first. On expiry the subtest is sent automatically: what
 * is still open goes as skipped.
 */
export function SubtestRunner({
  subtest,
  startedAt,
  serverClock,
  timerSlot,
  submitting,
  submitError,
  onSubmit,
}: SubtestRunnerProps) {
  const { t } = useTranslation('assessment');
  const { t: tCommon } = useTranslation('common');
  const [state, setState] = useState<AsturAnswerState>(() => initialState(subtest));
  const [timeUp, setTimeUp] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmSkipsOpen, setConfirmSkipsOpen] = useState(false);
  // PRO-438: the instruction stays reachable after the start — "Назад" on the
  // first page can't lead back to the intro card once the timer runs.
  const [instructionOpen, setInstructionOpen] = useState(false);
  const instructionId = useId();
  const submittedRef = useRef(false);

  const pageSize = pageSizeFor(subtest);
  const pageCount = Math.max(1, Math.ceil(subtest.items.length / pageSize));
  const isGeometry = subtest.key === 'geometric_figures';

  useEffect(() => {
    setPageIndex(0);
    setTimeUp(false);
    setConfirmSkipsOpen(false);
    setInstructionOpen(false);
    submittedRef.current = false;
    setState(initialState(subtest));
  }, [subtest.key]); // eslint-disable-line react-hooks/exhaustive-deps

  /** One submit per subtest — a click racing the timer must not send twice. */
  function send() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit({ answers: buildAsturAnswerPayload(subtest, state) });
  }

  // A failed submit re-opens the button for a manual retry.
  useEffect(() => {
    if (submitError) submittedRef.current = false;
  }, [submitError]);

  const durationMs = subtest.time_limit_sec !== null ? subtest.time_limit_sec * 1000 : null;
  const { remainingMs } = useCountdown(durationMs, subtest.key, () => {
    setTimeUp(true);
    send();
  }, startedAt, serverClock);

  const pageStart = pageIndex * pageSize;
  const pageItems = subtest.items.slice(pageStart, pageStart + pageSize);
  const isLastPage = pageIndex >= pageCount - 1;
  const pageDone = pageItems.every((_, offset) => isAsturItemDone(subtest, state, String(pageStart + offset + 1)));
  const allDone = areAllAsturItemsDone(subtest, state);
  const skippedCount = countAsturSkipped(subtest, state);

  function setAnswer(index: string, value: unknown) {
    setState((prev) => {
      const skipped = new Set(prev.skipped);
      skipped.delete(index);
      const touched = subtest.key === 'logical_schemas' ? new Set(prev.touched).add(index) : prev.touched;
      return { values: { ...prev.values, [index]: value }, skipped, touched };
    });
  }

  /** Skipping wipes the item back to blank: a skipped item goes to the
   *  server as `skipped` whatever was picked, so a pick left on screen under
   *  "Вернуться к заданию" showed an answer that was never sent. */
  function toggleSkip(index: string) {
    setState((prev) => {
      const skipped = new Set(prev.skipped);
      if (skipped.has(index)) {
        skipped.delete(index);
        return { ...prev, skipped };
      }
      skipped.add(index);
      const touched = new Set(prev.touched);
      touched.delete(index);
      const values = { ...prev.values, [index]: blankValue(subtest, subtest.items[Number(index) - 1]) };
      return { values, skipped, touched };
    });
  }

  function handlePrimary() {
    if (submitting) return;
    if (timeUp) {
      send();
      return;
    }
    if (!isLastPage) {
      if (!pageDone) return;
      setPageIndex((i) => i + 1);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!allDone) return;
    if (skippedCount > 0) setConfirmSkipsOpen(true);
    else send();
  }

  const primaryEnabled = !submitting && (timeUp || (isLastPage ? allDone : pageDone));

  return (
    <div className="rd-astur">
      {durationMs !== null &&
        timerSlot &&
        createPortal(
          <AssessmentTimer
            remainingMs={remainingMs}
            durationMs={durationMs}
            timeLabel={formatCountdownMmSs(remainingMs)}
            expired={timeUp}
            expiredMessage={t('astur.subtest.timeUp')}
            expiredLabel={t('astur.subtest.timeUpShort')}
            urgentBelowMs={15_000}
            variant="rail"
          />,
          timerSlot,
        )}
      <div className="rd-astur-content">
        <div className="rd-astur-heading">
          <div>
            <p className="rd-assessment-kicker">{t('rail.sectionAstur')}</p>
            <h1>{subtest.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setInstructionOpen((open) => !open)}
            aria-expanded={instructionOpen}
            aria-controls={instructionId}
            className="rd-astur-instruction-toggle"
          >
            <BookOpen size={17} aria-hidden="true" />
            {instructionOpen ? t('astur.subtest.hideInstruction') : t('astur.subtest.showInstruction')}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
        {instructionOpen && (
          <div id={instructionId} className="rd-astur-instruction">
            <Text variant="body-md" className="m-0 text-secondary whitespace-pre-wrap">
              {subtest.instruction}
            </Text>
            {/* The countdown runs off the server's startedAt (useCountdown) —
                opening the instruction neither pauses nor restarts it. */}
            {durationMs !== null && (
              <Text variant="caption" className="mt-2 mb-0 text-muted">
                {t('astur.subtest.instructionTimerNote')}
              </Text>
            )}
          </div>
        )}

        {pageCount > 1 && (
          <Text variant="caption" className="rd-astur-page-meta">
            {isGeometry
              ? t('astur.subtest.itemOf', { current: pageIndex + 1, total: subtest.items.length })
              : t('astur.subtest.pageOf', {
                  current: pageIndex + 1,
                  total: pageCount,
                  from: pageStart + 1,
                  to: pageStart + pageItems.length,
                  itemTotal: subtest.items.length,
                })}
          </Text>
        )}

        <div className="rd-astur-items">
          {pageItems.map((item, offset) => {
            const index = String(pageStart + offset + 1);
            const skipped = state.skipped.has(index);
            return (
              <div key={index} className="rd-astur-item" data-skipped={skipped}
                data-answered={!skipped && isAsturItemDone(subtest, state, index)}>
                <div className={cn(skipped && 'opacity-50')}>
                  {renderItem(subtest, item, pageStart + offset, state, setAnswer, t)}
                </div>
                <button
                  type="button"
                  onClick={() => toggleSkip(index)}
                  aria-pressed={skipped}
                  className={cn(
                    'rd-astur-skip self-start text-body-sm font-medium transition-colors',
                    skipped ? 'text-brand' : 'text-muted hover:text-secondary',
                  )}
                >
                  {skipped ? <Undo2 size={14} aria-hidden="true" /> : <SkipForward size={14} aria-hidden="true" />}
                  {skipped ? t('astur.subtest.unskip') : t('astur.subtest.skip')}
                </button>
              </div>
            );
          })}
        </div>

        {submitError && <p className="rd-assessment-error" role="alert">{submitError}</p>}

        <div className="rd-astur-footer">
          {!primaryEnabled && !submitting && (
            <Text variant="caption" className={cn('text-muted', isGeometry ? 'text-center' : 'text-right')}>
              {t(isGeometry ? 'astur.subtest.answerOrSkipOne' : 'astur.subtest.answerOrSkip')}
            </Text>
          )}
          <div className="rd-assessment-actions">
            <Button
              variant="ghost"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0 || submitting || timeUp}
            >
              {tCommon('back')}
            </Button>
            <Button size="lg" onClick={handlePrimary} disabled={!primaryEnabled} isLoading={(isLastPage || timeUp) && submitting}>
              {t('astur.subtest.next')}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        className="rd-astur-confirm"
        open={confirmSkipsOpen}
        title={t('astur.subtest.skipConfirmTitle', { count: skippedCount })}
        body={t('astur.subtest.skipConfirmBody')}
        confirmLabel={t('astur.subtest.skipConfirm')}
        cancelLabel={t('astur.subtest.skipCancel')}
        onConfirm={() => {
          setConfirmSkipsOpen(false);
          send();
        }}
        onCancel={() => setConfirmSkipsOpen(false)}
      />
    </div>
  );
}
