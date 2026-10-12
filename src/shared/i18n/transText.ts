/**
 * Props for a <Trans> whose values come from the address bar (`?email=`).
 * The app turns off i18next escaping globally, and <Trans> parses the
 * interpolated string as markup — so `?email=x</b><b class="…">…` would
 * inject styled text and attributes onto our elements. Escaping makes the
 * value plain text before parsing; shouldUnescape turns `&amp;` etc. back
 * into characters for display.
 */
export const EMAIL_AS_TEXT = {
  tOptions: { interpolation: { escapeValue: true } },
  shouldUnescape: true,
} as const;
