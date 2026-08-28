import { useEffect, useRef, useState } from 'react';

/**
 * Mirrors `active`, but only turns true after it's stayed true for `delayMs`
 * — and once shown, stays true for at least `minDurationMs` before it's
 * allowed to flip back off. A save that resolves inside `delayMs` (the
 * common case on a healthy connection) never surfaces here at all: no
 * loading indicator is the right affordance for something that finished
 * before a human could register it as "loading." Only a genuinely slow
 * request crosses the threshold and earns a spinner — and once it does, the
 * minimum hold keeps that spinner from itself blinking off within a frame.
 */
export function useDelayedFlag(active: boolean, delayMs = 250, minDurationMs = 250): boolean {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (active) {
      timerRef.current = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delayMs);
    } else if (shownAtRef.current !== null) {
      const remaining = Math.max(0, minDurationMs - (Date.now() - shownAtRef.current));
      timerRef.current = setTimeout(() => {
        shownAtRef.current = null;
        setVisible(false);
      }, remaining);
    } else {
      setVisible(false);
    }

    return () => clearTimeout(timerRef.current);
  }, [active, delayMs, minDurationMs]);

  return visible;
}
