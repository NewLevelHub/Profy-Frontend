import { useEffect, useRef, useState } from 'react';

export interface CountdownClockSync {
  serverNow: string;
  monotonicAtMs: number;
}

export function monotonicNow(): number {
  return typeof performance === 'undefined' ? 0 : performance.now();
}

/** Estimate the server wall clock without consulting the mutable device
 * clock. Safe to persist as an item-start anchor and recalibrate after a
 * reload with a fresh server sample. */
export function estimatedServerNowIso(clockSync?: CountdownClockSync | null): string | null {
  if (!clockSync) return null;
  const parsedServerNow = Date.parse(clockSync.serverNow);
  if (!Number.isFinite(parsedServerNow)) return null;
  const elapsedSinceSync = Math.max(0, monotonicNow() - clockSync.monotonicAtMs);
  return new Date(parsedServerNow + elapsedSinceSync).toISOString();
}

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
  clockSync?: CountdownClockSync | null,
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
    const now = monotonicNow();
    const parsedStart = startedAt ? Date.parse(startedAt) : Number.NaN;
    const parsedServerNow = clockSync ? Date.parse(clockSync.serverNow) : Number.NaN;
    let initialRemaining = durationMs;
    if (Number.isFinite(parsedStart) && Number.isFinite(parsedServerNow) && clockSync) {
      const elapsedSinceSync = Math.max(0, now - clockSync.monotonicAtMs);
      const estimatedServerNow = parsedServerNow + elapsedSinceSync;
      initialRemaining = durationMs - (estimatedServerNow - parsedStart);
    }
    const deadline = now + Math.min(durationMs, Math.max(0, initialRemaining));

    const tick = () => {
      const left = Math.min(durationMs, Math.max(0, deadline - monotonicNow()));
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
  }, [durationMs, resetKey, startedAt, clockSync?.serverNow, clockSync?.monotonicAtMs]);

  return { remainingMs, remainingSec: Math.ceil(remainingMs / 1000) };
}
