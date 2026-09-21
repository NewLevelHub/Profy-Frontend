import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/typography/Text';
import type {
  AsturAnalogyItem,
  AsturAwarenessItem,
  AsturClassificationItem,
  AsturContentSubtest,
  AsturGeneralizationItem,
  AsturLogicalSchemaItem,
  AsturNumericSeriesItem,
} from '@/shared/types';
import { useCountdown } from '../hooks/useCountdown';
import { areAllAsturItemsAnswered, isAsturItemAnswered } from '../utils/asturAnswersComplete';
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
  submitting: boolean;
  submitError: string | null;
  onSubmit: (answers: Record<string, unknown>) => void;
}

function formatMmSs(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function initialAnswers(subtest: AsturContentSubtest): Record<string, unknown> {
  const entries = subtest.items.map((item, i) => {
    const index = String(i + 1);
    if (subtest.key === 'classification') return [index, [] as string[]];
    if (subtest.key === 'numeric_series') return [index, ['', ''] as [string, string]];
    if (subtest.key === 'logical_schemas') return [index, [...(item as AsturLogicalSchemaItem).concepts]];
    return [index, ''];
  });
  return Object.fromEntries(entries);
}

function renderItem(
  subtest: AsturContentSubtest,
  item: AsturContentSubtest['items'][number],
  absoluteIndex: number,
  answers: Record<string, unknown>,
  setAnswer: (index: string, value: unknown) => void,
) {
  const index = String(absoluteIndex + 1);
  const displayIndex = absoluteIndex + 1;

  if (subtest.key === 'awareness') {
    const it = item as AsturAwarenessItem;
    return (
      <McQuestion
        key={index}
        index={displayIndex}
        prompt={it.text}
        options={it.options}
        value={answers[index] as string | undefined}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  if (subtest.key === 'analogies') {
    const it = item as AsturAnalogyItem;
    return (
      <McQuestion
        key={index}
        index={displayIndex}
        prompt={`«${it.pair[0]}» относится к «${it.pair[1]}» так же, как «${it.third}» относится к …`}
        options={it.options}
        value={answers[index] as string | undefined}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  if (subtest.key === 'classification') {
    const it = item as AsturClassificationItem;
    return (
      <PickTwoQuestion
        key={index}
        index={displayIndex}
        words={it.words}
        value={answers[index] as string[]}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  if (subtest.key === 'generalization') {
    const it = item as AsturGeneralizationItem;
    return (
      <OpenTextQuestion
        key={index}
        index={displayIndex}
        pair={it.pair}
        value={answers[index] as string}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  if (subtest.key === 'numeric_series') {
    const it = item as AsturNumericSeriesItem;
    return (
      <NumericPairQuestion
        key={index}
        index={displayIndex}
        sequence={it.sequence}
        value={answers[index] as [string, string]}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  if (subtest.key === 'geometric_figures') {
    return (
      <FigureAssemblyQuestion
        key={index}
        index={displayIndex}
        value={answers[index] as string | undefined}
        onChange={(v) => setAnswer(index, v)}
      />
    );
  }
  return (
    <HierarchyDragQuestion
      key={index}
      index={displayIndex}
      value={answers[index] as string[]}
      onChange={(v) => setAnswer(index, v)}
    />
  );
}

/**
 * One (non-lability) ASTUR subtest: items in pages of PAGE_SIZE (PRO-399),
 * one timer for the whole subtest. No auto-submit on expiry — but «Далее»
 * unlocks when the current page is complete OR time is up (PRO-400). On the
 * last page, «Далее» submits; earlier pages only advance.
 */
export function SubtestRunner({ subtest, submitting, submitError, onSubmit }: SubtestRunnerProps) {
  const { t } = useTranslation('assessment');
  const { t: tCommon } = useTranslation('common');
  const [answers, setAnswers] = useState<Record<string, unknown>>(() => initialAnswers(subtest));
  const [timeUp, setTimeUp] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(subtest.items.length / PAGE_SIZE));

  // New subtest (or remount) — reset local paging; answers re-init via key on parent if needed.
  useEffect(() => {
    setPageIndex(0);
    setTimeUp(false);
    setAnswers(initialAnswers(subtest));
  }, [subtest.key]);

  const durationMs = subtest.time_limit_sec !== null ? subtest.time_limit_sec * 1000 : null;
  const { remainingMs } = useCountdown(durationMs, subtest.key, () => setTimeUp(true));

  const pageStart = pageIndex * PAGE_SIZE;
  const pageItems = subtest.items.slice(pageStart, pageStart + PAGE_SIZE);
  const isLastPage = pageIndex >= pageCount - 1;

  const pageAnswered = pageItems.every((_, offset) =>
    isAsturItemAnswered(subtest.key, answers[String(pageStart + offset + 1)]),
  );
  // timeUp unlocks every page so the student can reach submit with blanks.
  const canProceed = pageAnswered || timeUp;
  const allAnswered = areAllAsturItemsAnswered(subtest, answers);

  function setAnswer(index: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  /** Числовые ряды хранятся как строки контролируемых инпутов — на выходе
   *  бэкенд (scripts/astur_bank.py NUMERIC_SERIES_ITEMS) ждёт числа. */
  function normalizedAnswers(): Record<string, unknown> {
    if (subtest.key !== 'numeric_series') return answers;
    return Object.fromEntries(
      Object.entries(answers).map(([index, value]) => {
        const [a, b] = value as [string, string];
        return [index, [Number(a) || 0, Number(b) || 0]];
      }),
    );
  }

  function handlePrimary() {
    if (!canProceed || submitting) return;
    if (isLastPage) {
      // Last page still respects PRO-400 for the whole subtest: all answered
      // or timer expired (same as pre-pagination).
      if (!allAnswered && !timeUp) return;
      onSubmit(normalizedAnswers());
      return;
    }
    setPageIndex((i) => i + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // On the last page before timeUp, require the full subtest complete — not
  // only the visible five — so blanks on earlier pages can't sneak through.
  const lastPageBlocked = isLastPage && !allAnswered && !timeUp;
  const primaryEnabled = isLastPage ? !lastPageBlocked && !submitting : canProceed && !submitting;

  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-5 !p-6 sm:!p-8">
        {durationMs !== null && (
          <div className="flex flex-col gap-1.5">
            <ProgressBar
              value={(remainingMs / durationMs) * 100}
              variant={remainingMs < 15000 ? 'accent' : 'brand'}
            />
            <Text
              variant="caption"
              className={cn('self-end', timeUp ? 'text-danger font-semibold' : 'text-muted')}
            >
              {timeUp ? t('astur.subtest.timeUp') : formatMmSs(remainingMs)}
            </Text>
          </div>
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
          {pageItems.map((item, offset) =>
            renderItem(subtest, item, pageStart + offset, answers, setAnswer),
          )}
        </div>

        {submitError && (
          <Text variant="body-sm" className="text-danger">
            {submitError}
          </Text>
        )}

        <div className="flex flex-col gap-2 w-full">
          {!primaryEnabled && !submitting && (
            <Text variant="caption" className="text-muted text-right">
              {durationMs !== null
                ? t('astur.subtest.nextBlockedTimed')
                : t('astur.subtest.nextBlocked')}
            </Text>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0 || submitting}
            >
              {tCommon('back')}
            </Button>
            <Button
              size="lg"
              onClick={handlePrimary}
              disabled={!primaryEnabled}
              isLoading={isLastPage && submitting}
            >
              {t('astur.subtest.next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
