import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/typography/Text';
import type { AsturContentSubtest, AsturItemAnswer, AsturLabilityItem } from '@/shared/types';
import { useCountdown } from '../hooks/useCountdown';

interface LabilityRunnerProps {
  subtest: AsturContentSubtest;
  itemLimitMs: number;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (payload: { answers: Record<string, AsturItemAnswer>; elapsed_ms: Record<string, number> }) => void;
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
 */
export function LabilityRunner({ subtest, itemLimitMs, submitting, submitError, onSubmit }: LabilityRunnerProps) {
  const { t } = useTranslation('assessment');
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AsturItemAnswer>>({});
  const [elapsedMs, setElapsedMs] = useState<Record<string, number>>({});
  const committedRef = useRef<Set<string>>(new Set());
  const [lockedIndex, setLockedIndex] = useState<string | null>(null);

  const items = subtest.items as AsturLabilityItem[];
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
    setAnswers(nextAnswers);
    setElapsedMs(nextElapsed);
    if (isLast) {
      onSubmit({ answers: nextAnswers, elapsed_ms: nextElapsed });
    } else {
      setItemIndex((i) => i + 1);
    }
  }

  const { remainingMs } = useCountdown(itemLimitMs, `${subtest.key}-${itemIndex}`, () =>
    commit({ status: 'skipped', value: null }, itemLimitMs),
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

        <Text variant="body-lg" className="font-semibold text-primary">
          {item.instruction}
        </Text>

        <div key={index} className="flex items-center gap-3">
          {item.options.map((option) => (
            <Button
              key={option}
              variant="ghost"
              disabled={locked}
              onClick={() => commit({ status: 'answered', value: option }, itemLimitMs - remainingMs)}
            >
              {OPTION_LABEL[option] ?? option}
            </Button>
          ))}
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
