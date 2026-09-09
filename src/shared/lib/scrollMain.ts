/**
 * AppLayout scrolls `<main>`, not `window`. In-page state changes (catalogue
 * pagination, filter resets) never touch the router, so AppLayout's
 * location-keyed scroll reset does not run — callers that swap tall content
 * must bump the same element themselves or the user stays stuck at the
 * previous scroll offset (usually the pager at the bottom).
 */
export function scrollMainToTop(behavior: ScrollBehavior = 'smooth'): void {
  const main = document.querySelector('main');
  if (main instanceof HTMLElement) {
    main.scrollTo({ top: 0, behavior });
    return;
  }
  window.scrollTo({ top: 0, behavior });
}
