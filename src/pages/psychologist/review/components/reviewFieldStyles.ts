/** Text fields of the report editor: a quiet well on the page ground that
 *  lifts to the surface colour while being edited. */
export const REVIEW_TEXTAREA =
  'block w-full rounded-[8px] border border-default bg-[color:var(--bg-page)] px-4 py-3 font-sans text-body-md text-heading ' +
  'focus:outline-none focus:border-brand focus:bg-surface transition-colors resize-y disabled:opacity-60';

/** Single-line field drawn as an underline — card titles, trait phrases. */
export const REVIEW_LINE_INPUT =
  'w-full min-w-0 bg-transparent border-0 border-b-[1.5px] border-b-[color:var(--hairline)] px-0 py-2 font-sans text-body-md text-heading ' +
  'focus:outline-none focus:border-brand transition-colors disabled:opacity-60';
