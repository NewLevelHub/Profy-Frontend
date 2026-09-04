import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Every custom `text-*` class in this codebase, split into the two groups
 * tailwind-merge must keep apart.
 *
 * Without this, `cn('text-caption', 'text-muted')` returned just `text-muted`:
 * tailwind-merge sees two `text-…` classes it doesn't recognise, assumes they
 * are the same property, and drops the earlier one. The size class lost, so
 * the element fell back to the inherited 16px body size — visible as text that
 * jumped from 13px to 16px the moment a color was added, e.g. a filter select
 * growing when it went from `text-mono-xs` to `text-mono-xs text-brand`.
 *
 * Both lists must stay in sync with `src/styles/tailwind.css` (`--text-*`
 * scale) and the `.text-*` color utilities in `src/styles/theme.css`.
 */
const FONT_SIZE_CLASSES = [
  'display-lg',
  'display-md',
  'display-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'caption',
  'mono-md',
  'mono-sm',
  'mono-xs',
  // Legacy aliases kept in theme.css — they set font-size too.
  'display',
  'h1',
  'title',
  'subtitle',
  'body',
  'label',
  'small',
  'tiny',
];

const TEXT_COLOR_CLASSES = [
  'primary',
  'secondary',
  'muted',
  'subtle',
  'placeholder',
  'brand',
  'brand-disabled',
  'on-brand',
  'accent',
  'danger',
  'success',
  'warning',
  'nav',
  'nav-active',
  'white',
];

// `extend`, not `override`: the built-in Tailwind scales (`text-sm`,
// `text-red-500`) stay in their groups and keep resolving among themselves,
// while the project's names are added alongside them.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZE_CLASSES }],
      'text-color': [{ text: TEXT_COLOR_CLASSES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
