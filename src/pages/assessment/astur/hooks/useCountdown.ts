import { useEffect, useRef, useState } from 'react';

/**
 * Generic ms countdown, restarted whenever `resetKey` changes (a new
 * subtest, a new lability command). Fires `onExpire` exactly once per
 * `resetKey` — a re-render doesn't re-trigger it. `durationMs === null`
 * means "no countdown for this screen" (kept as a hook, not conditional
 * rendering, so callers don't juggle two code paths).
 */
export function useCountdown(
  durationMs: number | null,
  resetKey: string,
  onExpire: () => void,
  startedAt?: string | null,
) {
  const [remainingMs, setRemainingMs] = useState(durationMs ?? 0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expiredRef.current = false;
    if (durationMs === null) {
      setRemainingMs(0);
      return;
    }
    const parsedStart = startedAt ? Date.parse(startedAt) : Number.NaN;
    const deadline = (Number.isFinite(parsedStart) ? parsedStart : Date.now()) + durationMs;

    const tick = () => {
      const left = Math.min(durationMs, Math.max(0, deadline - Date.now()));
      setRemainingMs(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs, resetKey, startedAt]);

  return { remainingMs, remainingSec: Math.ceil(remainingMs / 1000) };
}
