import { memo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface PointAllocatorItem {
  id: string;
  label: string;
}

export interface PointAllocatorProps {
  /** Пункты блока (Belbin: 8 на блок) — порядок рендера как передан. */
  items: PointAllocatorItem[];
  /** Фиксированная сумма, которая должна набраться по блоку (Belbin: 10). */
  total: number;
  /** Текущее распределение: `item.id` → баллы. Отсутствующий ключ = 0. */
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  className?: string;
}

/**
 * Атомарный контрол "распредели N баллов между пунктами" — Belbin (Ф2.6) и
 * любой другой ипсативный блок с той же формой. Живёт на props целиком:
 * не знает, какой блок сейчас, не считает завершённость раздела, не валидирует
 * на сервер — родительский хук экрана прохождения решает, что дальше.
 *
 * Слайдер один не подошёл бы: 10 баллов на 8 пунктов — шаг ~12.5% полосы на
 * пункт, слишком грубо для точного ввода. Степпер + прямой numeric-ввод дают
 * точное клавиатурное/тач-значение, слайдер остаётся годным для быстрой
 * грубой прикидки, но не единственным способом ввода.
 */
function PointAllocatorComponent({ items, total, value, onChange, className }: PointAllocatorProps) {
  const sum = items.reduce((acc, item) => acc + (value[item.id] ?? 0), 0);
  const remaining = total - sum;
  const isBalanced = remaining === 0;

  function setItemValue(id: string, next: number) {
    const current = value[id] ?? 0;
    const clamped = Math.max(0, Math.min(current + remaining, next));
    if (clamped === current) return;
    onChange({ ...value, [id]: clamped });
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-between rounded-[14px] border px-4 py-2.5 text-body-sm font-semibold transition-colors',
          isBalanced
            ? 'border-default bg-success-subtle text-success'
            : 'border-default bg-raised text-secondary',
        )}
        role="status"
        aria-live="polite"
      >
        <span>Осталось распределить</span>
        <span className="text-mono-md tabular-nums">
          {remaining} / {total}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const itemValue = value[item.id] ?? 0;
          const canIncrement = remaining > 0;
          const canDecrement = itemValue > 0;

          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-[14px] border border-default bg-page px-3 py-2"
            >
              <span className="flex-1 min-w-0 text-body-sm text-primary break-words">{item.label}</span>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setItemValue(item.id, itemValue - 1)}
                  disabled={!canDecrement}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-default text-secondary hover:text-primary hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Уменьшить «${item.label}»`}
                >
                  <Minus size={14} />
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={itemValue + remaining}
                  value={itemValue}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    if (Number.isNaN(parsed)) return;
                    setItemValue(item.id, Math.trunc(parsed));
                  }}
                  className="w-12 text-center text-mono-sm tabular-nums bg-transparent border border-default rounded-[10px] py-1 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]"
                  aria-label={`Баллы для «${item.label}»`}
                />

                <button
                  type="button"
                  onClick={() => setItemValue(item.id, itemValue + 1)}
                  disabled={!canIncrement}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-default text-secondary hover:text-primary hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Увеличить «${item.label}»`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const PointAllocator = memo(PointAllocatorComponent);
PointAllocator.displayName = 'PointAllocator';
