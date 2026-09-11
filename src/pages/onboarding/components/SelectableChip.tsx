/** Onboarding pill — selected = pine fill (same language as age/feedback
 *  tiles). Unselected sits on a soft field-tile. Deliberately neutral: never
 *  tinted to imply "good"/"bad" — step 2's easy vs. struggle columns rely on
 *  both sides looking identical.
 */
import { cn } from '@/shared/lib/cn';

export interface SelectableChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Already chosen in a sibling group where the same value can't mean two
   *  things at once (e.g. a subject marked both "легко" and "трудно"). */
  disabled?: boolean;
  disabledTitle?: string;
}

export function SelectableChip({
  label, selected, onClick, disabled, disabledTitle,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={selected}
      title={disabled ? disabledTitle : undefined}
      className={cn(
        'px-3.5 py-2 rounded-pill text-caption font-semibold border transition-colors',
        'disabled:cursor-not-allowed press-scale',
        // Подпись у своего варианта пишет человек: без max-w-full и переноса
        // длинная строка распирала группу, а .journey-shell обрезал её
        // overflow: hidden — чип молча терял хвост.
        'max-w-full text-left wrap-anywhere',
        selected
          ? 'bg-brand text-on-brand border-transparent'
          : 'field-tile text-secondary hover:border-[color:var(--pine)] hover:text-[color:var(--pine)]',
        disabled && !selected && 'opacity-45',
      )}
    >
      {label}
    </button>
  );
}
