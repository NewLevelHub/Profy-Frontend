import { type as typeClass } from '@/shared/ui/typography/tokens';

/**
 * Admin density tokens — same journey surface language as Profile / Universities
 * (soft paper tiles, 14px radius), kept as className fragments so the exception
 * cannot leak into Card/Button on student pages.
 *
 * Caption remains the table/body rhythm; the display face is reserved for the
 * page title via PageHeader.
 */

/** Base text rhythm for admin table rows and body copy. */
export const ADMIN_TEXT = typeClass.caption;

/** Table cell padding. Roomier than the original `px-2 py-1.5`: rows are
 *  scanned, and 6px of vertical padding made every table read as one grey
 *  block. Density still well below the product default `px-4 py-3`. */
export const ADMIN_CELL = 'px-3 py-2.5';

/** Journey tile radius — matches `.field-tile` / `.journey-feature`. */
export const ADMIN_RADIUS = 'rounded-[14px]';

/** Soft paper card — same recipe as `.field-tile`, with room to breathe. */
export const ADMIN_CARD = `field-tile p-4`;

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
  'w-full rounded-[14px] border border-default bg-[color-mix(in_srgb,var(--paper)_78%,transparent)] text-primary px-3 py-2.5 text-body-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)] transition-colors disabled:opacity-50';

/** Same as `ADMIN_INPUT`, sized for multi-line text. */
export const ADMIN_TEXTAREA = `${ADMIN_INPUT} min-h-[80px] resize-y`;

/**
 * Control in the filter/toolbar row — smaller than a form input, since these
 * sit inline in a dense bar rather than in a labelled form column.
 */
export const ADMIN_CONTROL =
  'rounded-[14px] border border-default bg-[color-mix(in_srgb,var(--paper)_78%,transparent)] text-primary px-3 py-1.5 font-sans text-caption normal-case tracking-normal focus:outline-none focus:border-brand focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)] transition-colors';

/** Small secondary button used in bars and pagers. */
export const ADMIN_BUTTON =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] border border-default text-secondary hover:border-strong hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_25%,transparent)]';
