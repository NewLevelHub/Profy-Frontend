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

/** Table cell padding. Roomier than the original `px-2 py-1.5`: rows are
 *  scanned, and 6px of vertical padding made every table read as one grey
 *  block. Density still well below the product default `px-4 py-3`. */
export const ADMIN_CELL = 'px-3 py-2.5';

/** The admin-wide radius ceiling. Use instead of `rounded-[var(--radius)]`. */
export const ADMIN_RADIUS = 'rounded-[3px]';

/** Card shell at admin density: ≤3px radius, hairline edge, no shadow. */
export const ADMIN_CARD = `bg-surface border border-default ${ADMIN_RADIUS} p-3`;

/**
 * Mono, uppercase, tracked. Reserved for exactly TWO jobs: table column
 * headers and form field labels.
 *
 * It used to carry counts, filter notes, statuses, badges, pager text and
 * section titles as well — six registers of shouting small caps on one screen,
 * with nothing left to mark what actually mattered. Everything else now uses
 * `ADMIN_META` (quiet sentence case) or `ADMIN_NUM` (tabular figures).
 */
export const MONO_LABEL = typeClass.monoLabel;

/** @deprecated Use `ADMIN_META` for prose meta, `ADMIN_NUM` for figures. */
export const MONO_MUTE = `${MONO_LABEL} text-muted`;

/**
 * Quiet secondary line: counts, hints, timestamps in prose, empty-state notes.
 * Sentence case on purpose — these are read, not scanned as labels.
 */
export const ADMIN_META = `${ADMIN_TEXT} text-muted`;

/** Figures that line up in a column: ids, ranks, scores, dates. */
export const ADMIN_NUM = 'font-mono text-mono-sm tabular-nums';

/** Sans, human-authored copy (names, notes, comments) at admin density. */
export const ADMIN_SANS = ADMIN_TEXT;

/** Compact bordered text/number input for admin edit forms. */
export const ADMIN_INPUT =
  'w-full rounded-[3px] border border-default bg-page text-primary px-2.5 py-2 text-body-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)] transition-colors disabled:opacity-50';

/** Same as `ADMIN_INPUT`, sized for multi-line text. */
export const ADMIN_TEXTAREA = `${ADMIN_INPUT} min-h-[80px] resize-y`;

/**
 * Control in the filter/toolbar row — smaller than a form input, since these
 * sit inline in a dense bar rather than in a labelled form column.
 */
export const ADMIN_CONTROL =
  'rounded-[3px] border border-default bg-page text-primary px-2.5 py-1.5 font-mono text-mono-xs normal-case tracking-normal focus:outline-none focus:border-brand focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)] transition-colors';

/** Small square-ish secondary button used in bars and pagers. */
export const ADMIN_BUTTON =
  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] border border-default text-secondary hover:border-strong hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)]';
