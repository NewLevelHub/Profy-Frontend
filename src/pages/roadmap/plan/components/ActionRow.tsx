import { memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { PlanAction } from '@/shared/types';

interface Props {
  action: PlanAction;
  done: boolean;
  counter: number;
  onToggle: () => void;
  onBump: () => void;
}

function ActionRowImpl({ action, done, counter, onToggle, onBump }: Props) {
  const isRepeat = action.kind === 'repeat' && !!action.count_target;

  return (
    <li className="flex items-start gap-2.5 py-2">
      <button
        type="button"
        aria-pressed={done}
        aria-label={isRepeat ? 'Отметить выполнение' : done ? 'Снять отметку' : 'Отметить готово'}
        onClick={isRepeat ? onBump : onToggle}
        className={cn(
          'mt-0.5 shrink-0 grid place-items-center rounded-md border text-body-xs font-semibold transition-colors',
          isRepeat ? 'h-6 min-w-9 px-1' : 'h-5 w-5',
          done
            ? 'bg-success border-success text-white'
            : 'border-default text-muted hover:border-brand',
        )}
      >
        {isRepeat ? `${counter}/${action.count_target}` : done && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('text-body-sm leading-snug', done && 'text-muted line-through decoration-1')}>
          {action.text}
        </p>
        <span className="block text-mono-xs text-muted mt-1">{action.time}</span>
      </div>
    </li>
  );
}

export const ActionRow = memo(ActionRowImpl);
