/**
 * Admin-only density tokens — "the same system at minimum volume" per the
 * design spec §13: 13px rows, 1.35 line-height, half-width padding vs. the
 * rest of the product, no radius over 3px anywhere, color only where it means
 * state, and Bricolage Grotesque reserved for exactly ONE heading per screen
 * (the page title) — every other heading, including inside cards, stays
 * Instrument Sans (the default `font-sans`, so no override needed there).
 *
 * These are plain className fragments, not new CSS rules — deliberately kept
 * out of theme.css/tailwind.css so the density exception can never leak into
 * `Card`/`Button`'s shared defaults on non-admin pages. Only admin/*.tsx and
 * shared/ui/admin/*.tsx should import from here.
 */

/** Base text rhythm for admin table rows and body copy. */
export const ADMIN_TEXT = 'text-[13px] leading-[1.35]';

/** Table cell padding — roughly half the product's default `px-4 py-3`. */
export const ADMIN_CELL = 'px-2 py-1.5';

/** The admin-wide radius ceiling. Use instead of `rounded-[var(--radius)]`. */
export const ADMIN_RADIUS = 'rounded-[3px]';

/** Card shell at admin density: half padding, ≤3px radius. */
export const ADMIN_CARD = `bg-surface border border-default ${ADMIN_RADIUS} p-2.5`;

/** Mono, uppercase, tracked — for anything machine-generated/looked-up (ids, dates, statuses, field codes, column headers, filter chips, scale values). */
export const MONO_LABEL = 'font-mono text-[11px] font-bold uppercase tracking-[.05em]';

/** `MONO_LABEL` in the mute/quiet tone, for meta lines and secondary machine data. */
export const MONO_MUTE = `${MONO_LABEL} text-muted`;

/** Sans, human-authored copy (names, notes, comments) at admin density. */
export const ADMIN_SANS = `font-sans ${ADMIN_TEXT}`;
