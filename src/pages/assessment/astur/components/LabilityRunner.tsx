import { useState } from 'react';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/typography/Text';
import { playClick } from '@/shared/lib/sounds';
import { cn } from '@/shared/lib/cn';
import type { AsturContentSubtest, AsturLabilityItem } from '@/shared/types';
import { useCountdown } from '../hooks/useCountdown';
import { LabilityChoiceGlyph, resolveLabilityGlyph } from './LabilityChoiceGlyph';

interface LabilityRunnerProps {
  subtest: AsturContentSubtest;
  itemLimitMs: number;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (answers: Record<string, unknown>, elapsedMs: Record<string, number>) => void;
}

/**
 * Субтест «Лабильность» — 8 команд одна за другой, каждая со своим коротким
 * таймером. Не переиспользует SubtestRunner — механика (per-item лимит,
 * авто-переход) принципиально другая.
 *
 * PRO-407: options render as large visual choice tiles (circle/square glyphs,
 * ±/✓/✗ marks, big digits/words) instead of ghost text buttons — the
 * instruction literally says «обведите кружок», so the affordance should look
 * like a shape you tap, not a label you read twice.
 */
export function LabilityRunner({ subtest, itemLimitMs, submitting, submitError, onSubmit }: LabilityRunnerProps) {
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsedMs, setElapsedMs] = useState<Record<string, number>>({});

  const items = subtest.items as AsturLabilityItem[];
  const item = items[itemIndex];
  const index = String(itemIndex + 1);
  const isLast = itemIndex === items.length - 1;

  function commit(answer: string, elapsed: number) {
    const nextAnswers = { ...answers, [index]: answer };
    const nextElapsed = { ...elapsedMs, [index]: elapsed };
    setAnswers(nextAnswers);
    setElapsedMs(nextElapsed);
    if (isLast) {
      onSubmit(nextAnswers, nextElapsed);
    } else {
      setItemIndex((i) => i + 1);
    }
  }

  const { remainingMs } = useCountdown(itemLimitMs, `${subtest.key}-${itemIndex}`, () => commit('', itemLimitMs));

  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-6 !p-6 sm:!p-8">
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={(remainingMs / itemLimitMs) * 100} variant={remainingMs < 1500 ? 'accent' : 'brand'} />
          <Text variant="caption" className="text-muted self-end">
            Команда {itemIndex + 1} из {items.length} · {(remainingMs / 1000).toFixed(1)} с
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
            return (
              <button
                key={option}
                type="button"
                disabled={submitting}
                aria-label={option}
                onClick={() => {
                  playClick();
                  commit(option, itemLimitMs - remainingMs);
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
                {showCaption && (
                  <span className="text-caption font-semibold text-brand">{option}</span>
                )}
              </button>
            );
          })}
        </div>

        {submitError && (
          <Text variant="body-sm" className="text-danger">
            {submitError}
          </Text>
        )}
        {submitting && (
          <Text variant="caption" className="text-muted">
            Отправка…
          </Text>
        )}
      </div>
    </div>
  );
}
