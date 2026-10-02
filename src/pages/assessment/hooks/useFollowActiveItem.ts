import { useEffect, useRef } from 'react';

/**
 * Pages that stack several items (LikertPage, PairPage): answering one
 * "cuts" to the next unanswered item via a smooth scroll, guiding the eye
 * down the page instead of leaving the user to hunt for what's next.
 * `activeId` is that next unanswered item (null once all are answered);
 * attach `itemRef(id)` to each item's block.
 *
 * `mode`: `center` (LikertPage) always brings the next question to the
 * middle — its questions sit far apart, the next one is usually off-screen.
 * `reveal` (PairPage) scrolls only when the next item isn't fully on screen,
 * and only as far as needed: five pairs mostly fit, and re-centering after
 * every pick shifted a page that had nothing to reveal. "On screen" respects
 * the item's scroll-margin (the sticky rail on top).
 *
 * No opacity/position entrance animation here: every item is already fully
 * visible on screen (the whole page renders at once), so animating one "in"
 * meant snapping an already-readable block to invisible and back — a
 * visible flicker rather than a transition.
 */
export function useFollowActiveItem(activeId: string | null, mode: 'center' | 'reveal' = 'center') {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const prevActiveIdRef = useRef<string | null>(activeId);
  const justBecameActive = activeId !== null && activeId !== prevActiveIdRef.current;

  useEffect(() => {
    const node = justBecameActive && activeId ? refs.current[activeId] : null;
    if (node && !(mode === 'reveal' && isFullyOnScreen(node))) {
      const reducedMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      node.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: mode === 'reveal' ? 'nearest' : 'center',
      });
    }
    prevActiveIdRef.current = activeId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };
}

function isFullyOnScreen(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  const top = parseFloat(style.scrollMarginTop) || 0;
  const bottom = window.innerHeight - (parseFloat(style.scrollMarginBottom) || 0);
  return rect.top >= top && rect.bottom <= bottom;
}
