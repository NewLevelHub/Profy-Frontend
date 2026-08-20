/**
 * Typographic class recipes — the only place new UI should pick a type style.
 *
 * Roles (authorship, not taste):
 *   display*  — Bricolage Grotesque. Screen titles / brand moments. Max 1–2 per screen.
 *   body*     — Instrument Sans. Everything a person wrote or reads as prose/UI.
 *   caption   — Instrument Sans. Dense meta, admin rows.
 *   mono*     — IBM Plex Mono. Machine/system content (ids, dates, statuses, codes).
 *
 * Prefer <Heading>, <Text>, <Mono> in JSX. Use these strings only when a
 * component cannot wrap the node (native <option>, third-party, className merge).
 *
 * Exceptions (do not "fix" these back to ad-hoc sizes):
 *   01 Spine step numerals — mono digits are the "spine of clarity" motif.
 *   02 OTP cells — mono numerals at display-sm size (input, not a heading).
 *   03 Emoji / mascot / Likert-dot sizes — icon geometry, not type.
 *   04 Likert pole labels — may clamp between caption and body-md so the
 *      scale stays readable beside the dots at every viewport.
 */
export const type = {
  displayLg: 'font-display text-display-lg font-bold',
  displayMd: 'font-display text-display-md font-bold',
  displaySm: 'font-display text-display-sm font-semibold',
  bodyLg: 'font-sans text-body-lg font-book',
  bodyMd: 'font-sans text-body-md font-book',
  bodySm: 'font-sans text-body-sm font-book',
  caption: 'font-sans text-caption font-medium',
  monoMd: 'font-mono text-mono-md',
  monoSm: 'font-mono text-mono-sm',
  monoXs: 'font-mono text-mono-xs',
  /** Uppercase machine labels: ids, dates, statuses, field codes, kickers. */
  monoLabel: 'font-mono text-mono-xs font-medium uppercase tracking-label',
} as const;

export type TypeRole = keyof typeof type;
