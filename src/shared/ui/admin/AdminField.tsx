import { useId, type ReactNode } from 'react';
import { Undo2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import { LockedFieldBadge } from '@/shared/ui/admin/LockedFieldBadge';

export interface AdminFieldRevert {
  /** What the content bank held before this field was edited. */
  bankValue?: unknown;
  /** False when the original was never recorded — the action then hands the
   *  field back to the next deploy's re-sync instead of restoring a value. */
  bankValueKnown: boolean;
  /** Button copy. Question-bank content really does restore a value, while a
   *  university lock only returns the field to seed control — the two must not
   *  make the same promise. */
  label?: string;
  /** Replaces the generated tooltip, for the same reason. */
  description?: string;
  pending: boolean;
  /** Set when the action is temporarily impossible; renders as a disabled
   *  control with this as the explanation. */
  disabledReason?: string;
  onRevert: () => void;
}

interface AdminFieldProps {
  label: string;
  locked?: boolean;
  lockReason?: string;
  /** Offers "вернуть исходное" next to the lock marker. Only meaningful on a
   *  locked field — an untouched one has nothing to revert. */
  revert?: AdminFieldRevert;
  /** Explains the field's effect — shown always, not hidden in a tooltip. */
  hint?: ReactNode;
  /** Validation message. Renders in clay and marks the control invalid. */
  error?: string;
  className?: string;
  children:
    | ReactNode
    | ((props: { id: string; invalid: boolean; describedBy: string | undefined }) => ReactNode);
}

/**
 * Label + optional lock marker, hint and error, above a form control.
 *
 * The render-prop form wires `id`/`aria-invalid`/`aria-describedby` onto the
 * control so the label and error are actually associated for screen readers —
 * the previous version rendered a bare `<span>` label next to an unlabelled
 * input.
 */
export function AdminField({
  label,
  locked,
  lockReason,
  revert,
  hint,
  error,
  className,
  children,
}: AdminFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <label htmlFor={id} className={cn(MONO_LABEL, error ? 'text-danger' : 'text-muted')}>
          {label}
        </label>
        {locked && <LockedFieldBadge reason={lockReason} />}
        {locked && revert && <RevertButton {...revert} />}
      </div>

      {/* `describedBy` must reach the control, otherwise the hint and the error
          below are rendered with ids nothing points at — visible on screen and
          invisible to a screen reader, which is the half that needs them. */}
      {typeof children === 'function'
        ? children({
            id,
            invalid: Boolean(error),
            describedBy: error ? errorId : hint ? hintId : undefined,
          })
        : children}

      {error ? (
        <p id={errorId} role="alert" className={cn(ADMIN_TEXT, 'text-danger m-0')}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={cn(ADMIN_TEXT, 'text-muted m-0')}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Undo one admin edit.
 *
 * Before PRO-262 there was no way back: a PATCH recorded an override that the
 * seed re-sync composed back over the bank on every deploy, so one mistyped
 * character pinned a field forever and only a hand edit in the database could
 * free it. The tooltip shows what the value will become, because "вернуть
 * исходное" is worth nothing if you cannot see what "исходное" is.
 */
function RevertButton({
  bankValue,
  bankValueKnown,
  label = 'Вернуть исходное',
  description,
  pending,
  disabledReason,
  onRevert,
}: AdminFieldRevert) {
  const content = disabledReason
    ? disabledReason
    : (description ??
      (bankValueKnown
        ? `Вернуть значение из контент-банка: ${formatBankValue(bankValue)}`
        : // Overrides written before the original was recorded. Saying so beats
          // implying a restore that will not happen until the next deploy.
          'Исходное значение не сохранялось. Правка будет снята, а значение вернёт ближайший деплой.'));

  return (
    <Tooltip content={content}>
      <button
        type="button"
        onClick={onRevert}
        disabled={pending || Boolean(disabledReason)}
        className={cn(
          MONO_LABEL,
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] transition-colors',
          'text-muted hover:text-primary hover:bg-hover',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        )}
      >
        <Undo2 size={10} />
        {pending ? 'Применяю…' : label}
      </button>
    </Tooltip>
  );
}

const BANK_VALUE_PREVIEW_LIMIT = 120;

function formatBankValue(value: unknown): string {
  if (value === null || value === undefined) return 'пусто';
  if (Array.isArray(value)) return value.length === 0 ? 'пустой список' : value.join(', ');
  const text = String(value);
  return text.length > BANK_VALUE_PREVIEW_LIMIT
    ? `${text.slice(0, BANK_VALUE_PREVIEW_LIMIT)}…`
    : text;
}
