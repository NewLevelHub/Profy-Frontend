import { type as typeClass } from '@/shared/ui/typography/tokens';

/**
 * Admin-only density tokens — "the same system at minimum volume".
 * Caption (13/1.35) is the admin body; Bricolage is reserved for exactly
 * ONE heading per screen (the page title). Machine content uses monoLabel.
 *
 * Plain className fragments, not new CSS rules — kept out of theme.css so
 * the density exception cannot leak into Card/Button on student pages.
 */

/** Base text rhythm for admin table rows and body copy. */
export const ADMIN_TEXT = typeClass.caption;

/** Table cell padding — roughly half the product's default `px-4 py-3`. */
export const ADMIN_CELL = 'px-2 py-1.5';

/** The admin-wide radius ceiling. Use instead of `rounded-[var(--radius)]`. */
export const ADMIN_RADIUS = 'rounded-[3px]';

/** Card shell at admin density: half padding, ≤3px radius. */
export const ADMIN_CARD = `bg-surface border border-default ${ADMIN_RADIUS} p-2.5`;

/** Mono, uppercase, tracked — machine-generated/looked-up content. */
export const MONO_LABEL = typeClass.monoLabel;

/** `MONO_LABEL` in the mute/quiet tone, for meta lines and secondary machine data. */
export const MONO_MUTE = `${MONO_LABEL} text-muted`;

/** Sans, human-authored copy (names, notes, comments) at admin density. */
export const ADMIN_SANS = ADMIN_TEXT;

/** Compact bordered text/number input for admin edit forms. */
export const ADMIN_INPUT =
  'w-full rounded-[3px] border border-default bg-page text-primary px-2 py-1.5 text-body-sm focus:outline-none focus:border-brand transition-colors disabled:opacity-50';

/** Same as `ADMIN_INPUT`, sized for multi-line text. */
export const ADMIN_TEXTAREA = `${ADMIN_INPUT} min-h-[80px] resize-y`;
