import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_TEXT, MONO_LABEL } from '@/shared/ui/admin/density';
import { LockedFieldBadge } from '@/shared/ui/admin/LockedFieldBadge';

interface AdminFieldProps {
  label: string;
  locked?: boolean;
  lockReason?: string;
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
export function AdminField({ label, locked, lockReason, hint, error, className, children }: AdminFieldProps) {
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
