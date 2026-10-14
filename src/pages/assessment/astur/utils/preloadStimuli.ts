import type { AsturContentSubtest } from '@/shared/types';

/**
 * Fetches a subtest's picture stimuli (figure assembly: ~90 kB PNG × 5 per
 * task) into the browser cache. Called from the subtest intro, before the
 * server-side timer starts: otherwise each task's pictures downloaded only
 * when it came on screen, and on a slow connection that came out of the
 * student's time limit.
 */
export function preloadStimuli(subtest: AsturContentSubtest): void {
  for (const item of subtest.items) {
    if (!('stimulus' in item) || !item.stimulus) continue;
    for (const path of [item.stimulus.target, ...Object.values(item.stimulus.options)]) {
      new Image().src = `/${path}`;
    }
  }
}
