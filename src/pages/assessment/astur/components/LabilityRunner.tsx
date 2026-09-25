import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/typography/Text';
import { playClick } from '@/shared/lib/sounds';
import { cn } from '@/shared/lib/cn';
import type { AsturContentSubtest, AsturItemAnswer, AsturLabilityItem } from '@/shared/types';
import { useCountdown } from '../hooks/useCountdown';
import { LabilityChoiceGlyph, resolveLabilityGlyph } from './LabilityChoiceGlyph';

interface LabilityRunnerProps {
  subtest: AsturContentSubtest;
  runId: string;
  startedAt: string | null;
  itemLimitMs: number;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (payload: { answers: Record<string, AsturItemAnswer>; elapsed_ms: Record<string, number> }) => void;
}

interface LabilityDraft {
  startedAt: string | null;
  itemIndex: number;
  answers: Record<string, AsturItemAnswer>;
  elapsedMs: Record<string, number>;
  itemStartedAt: string;
}

function draftKey(runId: string) {
  return `profy-astur-lability:${runId}`;
}

function readDraft(runId: string, startedAt: string | null, itemCount: number): LabilityDraft {
  const fresh = (): LabilityDraft => ({
    startedAt,
    itemIndex: 0,
    answers: {},
    elapsedMs: {},
    itemStartedAt: new Date().toISOString(),
  });
  if (!runId) return fresh();
  try {
    const raw = sessionStorage.getItem(draftKey(runId));
    if (!raw) return fresh();
    const saved = JSON.parse(raw) as LabilityDraft;
    if (
      saved.startedAt !== startedAt
      || !Number.isInteger(saved.itemIndex)
      || saved.itemIndex < 0
      || saved.itemIndex >= itemCount
      || !saved.answers
      || !saved.elapsedMs
      || !Number.isFinite(Date.parse(saved.itemStartedAt))
    ) return fresh();
    return saved;
  } catch {
    return fresh();
  }
}

const OPTION_LABEL: Record<string, string> = {
  кружок: 'Кружок',
  квадрат: 'Квадрат',
  плюс: 'Плюс',
  минус: 'Минус',
  галочка: 'Галочка (✓)',
  крестик: 'Крестик (✗)',
  да: 'Да',
  нет: 'Нет',
  выше: 'Выше',
  ниже: 'Ниже',
};

/**
 * Быстрые инструкции (лабильность) — 8 команд одна за другой, у каждой свой
 * короткий лимит; каждая — выбор из двух кнопок (Ф3.6, 2026-09-18).
 *
 * PRO-427 §17: a command is committed exactly once — a click and the
 * timer firing in the same moment can't both count (`committedRef`), and
 * the buttons lock the instant a choice is made. A command left unanswered
 * when its time runs out is sent as an explicit skip, never as a blank
 * "answer". The whole block goes to the server in one idempotent submit.
 *
 * PRO-407: options render as large visual choice tiles (circle/square glyphs,
 * ±/✓/✗ marks, big digits/words) instead of ghost text buttons — the
 * instruction literally says «обведите кружок», so the affordance should look
 * like a shape you tap, not a label you read twice.
 */
export function LabilityRunner({
  subtest,
  runId,
  startedAt,
  itemLimitMs,
  submitting,
  submitError,
  onSubmit,
}: LabilityRunnerProps) {
  const { t } = useTranslation('assessment');
  const items = subtest.items as AsturLabilityItem[];
  const initialRef = useRef<LabilityDraft | null>(null);
  if (initialRef.current === null) initialRef.current = readDraft(runId, startedAt, items.length);
  const initial = initialRef.current;
  const [itemIndex, setItemIndex] = useState(initial.itemIndex);
  const [answers, setAnswers] = useState<Record<string, AsturItemAnswer>>(initial.answers);
  const [elapsedMs, setElapsedMs] = useState<Record<string, number>>(initial.elapsedMs);
  const [itemStartedAt, setItemStartedAt] = useState(initial.itemStartedAt);
  const committedRef = useRef<Set<string>>(new Set(Object.keys(initial.answers)));
  const [lockedIndex, setLockedIndex] = useState<string | null>(
    initial.answers[String(initial.itemIndex + 1)] ? String(initial.itemIndex + 1) : null,
  );

  const item = items[itemIndex];
  const index = String(itemIndex + 1);
  const isLast = itemIndex === items.length - 1;
  const locked = lockedIndex === index || submitting;

  function commit(answer: AsturItemAnswer, elapsed: number) {
    if (committedRef.current.has(index)) return;
    committedRef.current.add(index);
    setLockedIndex(index);
    const nextAnswers = { ...answers, [index]: answer };
    const nextElapsed = { ...elapsedMs, [index]: Math.max(0, Math.round(elapsed)) };
    const nextItemStartedAt = new Date().toISOString();
    setAnswers(nextAnswers);
    setElapsedMs(nextElapsed);
    try {
      sessionStorage.setItem(draftKey(runId), JSON.stringify({
        startedAt,
        itemIndex: isLast ? itemIndex : itemIndex + 1,
        answers: nextAnswers,
        elapsedMs: nextElapsed,
        itemStartedAt: nextItemStartedAt,
      } satisfies LabilityDraft));
    } catch {
      // The server anchor still protects the block timing when storage is unavailable.
    }
    if (isLast) {
      onSubmit({ answers: nextAnswers, elapsed_ms: nextElapsed });
    } else {
      setItemStartedAt(nextItemStartedAt);
      setItemIndex((i) => i + 1);
    }
  }

  const { remainingMs } = useCountdown(
    itemLimitMs,
    `${subtest.key}-${itemIndex}`,
    () => commit({ status: 'skipped', value: null }, itemLimitMs),
    itemStartedAt,
  );

  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-5 !p-6 sm:!p-8">
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={(remainingMs / itemLimitMs) * 100} variant={remainingMs < 1500 ? 'accent' : 'brand'} />
          <Text variant="caption" className="text-muted self-end">
            {t('astur.labilityHeader', { x: itemIndex + 1, y: items.length, t: (remainingMs / 1000).toFixed(1) })}
          </Text>
        </div>

        <Text variant="body-lg" className="font-semibold text-primary text-balance">
          {item.instruction}
        </Text>

        <div
          key={index}
          className="grid grid-cols-2 gap-3 sm:gap-4"
          style={{ animation: 'scale-in 0.18s ease both' }}
        >
          {item.options.map((option) => {
            const glyph = resolveLabilityGlyph(option, item.answer_format);
            const showCaption = glyph.kind !== 'digit' && glyph.kind !== 'word';
            const label = OPTION_LABEL[option] ?? option;
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                aria-label={label}
                onClick={() => {
                  playClick();
                  commit({ status: 'answered', value: option }, itemLimitMs - remainingMs);
                }}
                className={cn(
                  'press-scale flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-[18px]',
                  'border-2 border-brand bg-transparent px-4 py-5 text-brand',
                  'transition-colors hover:bg-brand-subtle',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  'focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                <LabilityChoiceGlyph glyph={glyph} />
                {showCaption && <span className="text-caption font-semibold text-brand">{label}</span>}
              </button>
            );
          })}
        </div>

        {submitError && (
          <div className="flex flex-col items-start gap-2">
            <Text variant="body-sm" className="text-danger">
              {submitError}
            </Text>
            {isLast && lockedIndex === index && (
              <Button
                variant="ghost"
                onClick={() => onSubmit({ answers, elapsed_ms: elapsedMs })}
                disabled={submitting}
              >
                {t('astur.retrySubmit')}
              </Button>
            )}
          </div>
        )}
        {submitting && (
          <Text variant="caption" className="text-muted">
            {t('astur.labilitySending')}
          </Text>
        )}
      </div>
    </div>
  );
}
