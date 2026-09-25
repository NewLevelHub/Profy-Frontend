import { useEffect, useRef, useState } from 'react';
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
import { useCountdown } from '../hooks/useCountdown';
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

/** Same page size as the main Likert battery (`buildPages` LIKERT_PAGE_SIZE) — PRO-399. */
const PAGE_SIZE = 5;

interface SubtestRunnerProps {
  subtest: AsturContentSubtest;
  startedAt: string | null;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (payload: { answers: Record<string, AsturItemAnswer> }) => void;
}

function initialState(subtest: AsturContentSubtest): AsturAnswerState {
  const values = Object.fromEntries(
    subtest.items.map((item, i) => {
      const index = String(i + 1);
      if (subtest.key === 'classification') return [index, [] as string[]];
      if (subtest.key === 'numeric_series') return [index, ['', ''] as [string, string]];
      if (subtest.key === 'logical_schemas') return [index, [...(item as AsturLogicalSchemaItem).concepts]];
      return [index, ''];
    }),
  );
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
          confirmed={state.touched.has(index)} onChange={(v) => setAnswer(index, v)} />
      );
  }
}

/**
 * One (non-lability) ASTUR subtest: items in pages of PAGE_SIZE (PRO-399),
 * one timer for the whole subtest. Every item is either answered or
 * explicitly skipped (PRO-427 §11) — «Далее» unlocks once each item on the
 * page is one of the two (PRO-400), and sending a subtest with skips asks
 * for confirmation first. On expiry the subtest is sent automatically: what
 * is still open goes as skipped.
 */
export function SubtestRunner({ subtest, startedAt, submitting, submitError, onSubmit }: SubtestRunnerProps) {
  const { t } = useTranslation('assessment');
  const { t: tCommon } = useTranslation('common');
  const [state, setState] = useState<AsturAnswerState>(() => initialState(subtest));
  const [timeUp, setTimeUp] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmSkipsOpen, setConfirmSkipsOpen] = useState(false);
  const submittedRef = useRef(false);

  const pageCount = Math.max(1, Math.ceil(subtest.items.length / PAGE_SIZE));

  useEffect(() => {
    setPageIndex(0);
    setTimeUp(false);
    setConfirmSkipsOpen(false);
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
  }, startedAt);

  const pageStart = pageIndex * PAGE_SIZE;
  const pageItems = subtest.items.slice(pageStart, pageStart + PAGE_SIZE);
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

  function toggleSkip(index: string) {
    setState((prev) => {
      const skipped = new Set(prev.skipped);
      if (skipped.has(index)) skipped.delete(index);
      else skipped.add(index);
      return { ...prev, skipped };
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
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-5 !p-6 sm:!p-8">
        {durationMs !== null && (
          <AssessmentTimer
            remainingMs={remainingMs}
            durationMs={durationMs}
            timeLabel={formatCountdownMmSs(remainingMs)}
            expired={timeUp}
            expiredMessage={t('astur.subtest.timeUp')}
            urgentBelowMs={15_000}
            sticky
          />
        )}

        {pageCount > 1 && (
          <Text variant="caption" className="text-muted">
            {t('astur.subtest.pageOf', {
              current: pageIndex + 1,
              total: pageCount,
              from: pageStart + 1,
              to: pageStart + pageItems.length,
              itemTotal: subtest.items.length,
            })}
          </Text>
        )}

        <div className="flex flex-col gap-6">
          {pageItems.map((item, offset) => {
            const index = String(pageStart + offset + 1);
            const skipped = state.skipped.has(index);
            return (
              <div key={index} className="flex flex-col gap-2">
                <div className={cn(skipped && 'opacity-50')}>
                  {renderItem(subtest, item, pageStart + offset, state, setAnswer, t)}
                </div>
                <button
                  type="button"
                  onClick={() => toggleSkip(index)}
                  aria-pressed={skipped}
                  className={cn(
                    'self-start text-body-sm font-medium transition-colors',
                    skipped ? 'text-brand' : 'text-muted hover:text-secondary',
                  )}
                >
                  {skipped ? t('astur.subtest.unskip') : t('astur.subtest.skip')}
                </button>
              </div>
            );
          })}
        </div>

        {submitError && (
          <Text variant="body-sm" className="text-danger">
            {submitError}
          </Text>
        )}

        <div className="flex flex-col gap-2 w-full">
          {!primaryEnabled && !submitting && (
            <Text variant="caption" className="text-muted text-right">
              {t('astur.subtest.answerOrSkip')}
            </Text>
          )}
          <div className="flex items-center justify-between gap-3">
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
