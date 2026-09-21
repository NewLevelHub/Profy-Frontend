import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/typography/Text';
import type { AsturContentSubtest, AsturLabilityItem } from '@/shared/types';
import { useCountdown } from '../hooks/useCountdown';

interface LabilityRunnerProps {
  subtest: AsturContentSubtest;
  itemLimitMs: number;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (answers: Record<string, unknown>, elapsedMs: Record<string, number>) => void;
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
 * Субтест «Лабильность» — отдельный компонент (Ф3.6): 8 команд одна за
 * другой, каждая со своим коротким таймером и своим форматом ответа. Не
 * переиспользует SubtestRunner — механика (per-item лимит, авто-переход
 * без общей кнопки "Далее" на весь блок) принципиально другая (Ф3.4).
 *
 * Every item is a 2-way choice rendered as two buttons (2026-09-18: was a
 * free-text input for every format except 'shape' — under a per-item timer
 * that meant reading the instruction, working out the answer, AND typing it
 * correctly, which live in-office testing found genuinely hard even for an
 * adult). Nothing left needs a text field.
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
      <div className="assessment-stage__shell journey-shell flex flex-col gap-5 !p-6 sm:!p-8">
      <div className="flex flex-col gap-1.5">
        <ProgressBar value={(remainingMs / itemLimitMs) * 100} variant={remainingMs < 1500 ? 'accent' : 'brand'} />
        <Text variant="caption" className="text-muted self-end">
          Команда {itemIndex + 1} из {items.length} · {(remainingMs / 1000).toFixed(1)} с
        </Text>
      </div>

      <Text variant="body-lg" className="font-semibold text-primary">
        {item.instruction}
      </Text>

      <div key={index} className="flex items-center gap-3">
        {item.options.map((option) => (
          <Button key={option} variant="ghost" onClick={() => commit(option, itemLimitMs - remainingMs)}>
            {OPTION_LABEL[option] ?? option}
          </Button>
        ))}
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
