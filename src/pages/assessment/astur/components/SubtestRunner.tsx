import { useState } from 'react';
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
import { McQuestion } from './McQuestion';
import { PickTwoQuestion } from './PickTwoQuestion';
import { OpenTextQuestion } from './OpenTextQuestion';
import { NumericPairQuestion } from './NumericPairQuestion';
import { HierarchyDragQuestion } from './HierarchyDragQuestion';
import { FigureAssemblyQuestion } from './FigureAssemblyQuestion';

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

/** Прогон одного (не-лабильного) субтеста: все пункты на одном экране,
 *  таймер на весь субтест. По истечении он НЕ отправляет ответы сам —
 *  astur_timer_config.json прямо документирует его как мягкую подсказку,
 *  а не жёсткий обрыв (реальное время на вдумчивый ответ, особенно в
 *  «Обобщении», у разных студентов сильно расходится с оценкой в конфиге;
 *  досрочная отправка обрывала бы работу на середине). По истечении таймер
 *  просто переходит в тревожный режим и ждёт, пока студент сам нажмёт
 *  «Далее». Формат ввода переключается по `subtest.key`. */
export function SubtestRunner({ subtest, submitting, submitError, onSubmit }: SubtestRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(() => initialAnswers(subtest));
  const [timeUp, setTimeUp] = useState(false);

  const durationMs = subtest.time_limit_sec !== null ? subtest.time_limit_sec * 1000 : null;
  const { remainingMs } = useCountdown(durationMs, subtest.key, () => setTimeUp(true));

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

  return (
    <div className="assessment-stage mx-auto w-full max-w-[720px]">
      <div className="assessment-stage__shell journey-shell flex flex-col gap-5 !p-6 sm:!p-8">
      {durationMs !== null && (
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={(remainingMs / durationMs) * 100} variant={remainingMs < 15000 ? 'accent' : 'brand'} />
          <Text variant="caption" className={cn('self-end', timeUp ? 'text-danger font-semibold' : 'text-muted')}>
            {timeUp ? 'Время вышло — закончи и нажми «Далее»' : formatMmSs(remainingMs)}
          </Text>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {subtest.items.map((item, i) => {
          const index = String(i + 1);
          if (subtest.key === 'awareness') {
            const it = item as AsturAwarenessItem;
            return (
              <McQuestion key={index} index={i + 1} prompt={it.text} options={it.options}
                value={answers[index] as string | undefined} onChange={(v) => setAnswer(index, v)} />
            );
          }
          if (subtest.key === 'analogies') {
            const it = item as AsturAnalogyItem;
            return (
              <McQuestion key={index} index={i + 1}
                prompt={`«${it.pair[0]}» относится к «${it.pair[1]}» так же, как «${it.third}» относится к …`}
                options={it.options}
                value={answers[index] as string | undefined} onChange={(v) => setAnswer(index, v)} />
            );
          }
          if (subtest.key === 'classification') {
            const it = item as AsturClassificationItem;
            return (
              <PickTwoQuestion key={index} index={i + 1} words={it.words}
                value={answers[index] as string[]} onChange={(v) => setAnswer(index, v)} />
            );
          }
          if (subtest.key === 'generalization') {
            const it = item as AsturGeneralizationItem;
            return (
              <OpenTextQuestion key={index} index={i + 1} pair={it.pair}
                value={answers[index] as string} onChange={(v) => setAnswer(index, v)} />
            );
          }
          if (subtest.key === 'numeric_series') {
            const it = item as AsturNumericSeriesItem;
            return (
              <NumericPairQuestion key={index} index={i + 1} sequence={it.sequence}
                value={answers[index] as [string, string]} onChange={(v) => setAnswer(index, v)} />
            );
          }
          if (subtest.key === 'geometric_figures') {
            return (
              <FigureAssemblyQuestion key={index} index={i + 1}
                value={answers[index] as string | undefined} onChange={(v) => setAnswer(index, v)} />
            );
          }
          // logical_schemas
          return (
            <HierarchyDragQuestion key={index} index={i + 1}
              value={answers[index] as string[]} onChange={(v) => setAnswer(index, v)} />
          );
        })}
      </div>

      {submitError && (
        <Text variant="body-sm" className="text-danger">
          {submitError}
        </Text>
      )}

      <Button size="lg" onClick={() => onSubmit(normalizedAnswers())} isLoading={submitting} className="self-end">
        Далее
      </Button>
      </div>
    </div>
  );
}
