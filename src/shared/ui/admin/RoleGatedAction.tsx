import { cloneElement, isValidElement, type ReactElement } from 'react';
import { Tooltip } from '@/shared/ui/Tooltip';
import { REQUIRES_ADMIN_TOOLTIP } from '@/shared/lib/adminRole';

interface GatableElementProps {
  disabled?: boolean;
  'aria-disabled'?: boolean;
}

interface RoleGatedActionProps {
  /** True when the current role is allowed to perform the wrapped action. */
  allowed: boolean;
  /** Tooltip shown when not allowed. Defaults to the Operator-vs-Administrator copy. */
  reason?: string;
  children: ReactElement<GatableElementProps>;
}

/**
 * Wraps a single action element (typically a Button) and renders it visibly
 * disabled with an explanatory tooltip when the current role isn't allowed to
 * use it — never silently hidden, per the design spec (a missing role is a
 * real access dimension the user should see, unlike e.g. age-gated actions
 * elsewhere in the app that hide outright).
 *
 * The wrapper span stays keyboard-focusable so the tooltip is reachable via
 * Tab even though the inner disabled button itself drops out of tab order.
 */
export function RoleGatedAction({ allowed, reason = REQUIRES_ADMIN_TOOLTIP, children }: RoleGatedActionProps) {
  if (allowed) return children;
  if (!isValidElement(children)) return children;

  const gated = cloneElement(children, { disabled: true, 'aria-disabled': true });

  return (
    <Tooltip content={reason}>
      <span tabIndex={0} className="inline-flex rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]">
        {gated}
      </span>
    </Tooltip>
  );
}
