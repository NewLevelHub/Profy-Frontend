import type { MouseEvent } from 'react';

/** AppLayout owns history-based scroll restoration. In-page jumps keep the
 * current history entry and move focus into the selected section instead. */
export function scrollToStudentSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ block: 'start' });
  target.focus({ preventScroll: true });
}
