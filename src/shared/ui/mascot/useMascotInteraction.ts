import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Interactive-mascot behaviour for the `interactive` prop on `<Mascot>`.
 *
 * The sprite stays a single static PNG — everything here is a `transform` on
 * wrapper layers, so there is no rigging and nothing to redraw:
 *
 *  - lean: the body drifts a few px / degrees toward the pointer while it's
 *    near (driven from JS via CSS custom properties on the returned ref node);
 *  - hop: one squash-and-stretch bounce on pointer-down (`hop` flag → CSS class).
 *
 * The idle "breathing" loop is pure CSS (`.mascot-breath`) and needs nothing
 * from here. All of it is gated on `(pointer: fine)` and disabled under
 * `prefers-reduced-motion: reduce`, same policy as the blink overlay.
 */

// Pointer within this distance (px) of the mascot centre starts pulling the lean.
const INFLUENCE_PX = 520;
// Furthest the body leans horizontally; vertical pull is half this.
const MAX_SHIFT_PX = 6;
// Furthest the body tilts.
const MAX_TILT_DEG = 3.2;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: fine)').matches;
}

export interface MascotInteraction {
  /** Attach to the lean layer — receives the pointer-driven CSS variables. */
  ref: (node: HTMLDivElement | null) => void;
  /** True while the one-shot hop animation should be running. */
  hop: boolean;
  /** Wire to the lean layer's `onPointerDown`. */
  onPointerDown: () => void;
  /** Wire to the breath layer's `onAnimationEnd` (only the hop keyframes end). */
  onAnimationEnd: () => void;
}

export function useMascotInteraction(enabled: boolean): MascotInteraction {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [hop, setHop] = useState(false);

  const ref = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion() || !hasFinePointer()) return;

    function writeVars(shiftX: number, shiftY: number, tilt: number) {
      const el = nodeRef.current;
      if (!el) return;
      el.style.setProperty('--mascot-shift-x', `${shiftX.toFixed(2)}px`);
      el.style.setProperty('--mascot-shift-y', `${shiftY.toFixed(2)}px`);
      el.style.setProperty('--mascot-tilt', `${tilt.toFixed(2)}deg`);
    }

    function settle() {
      const el = nodeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pointer = pointerRef.current;
      if (!pointer || rect.width === 0) {
        writeVars(0, 0, 0);
        return;
      }
      const dx = pointer.x - (rect.left + rect.width / 2);
      const dy = pointer.y - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - dist / INFLUENCE_PX);
      if (pull === 0 || dist === 0) {
        writeVars(0, 0, 0);
        return;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      writeVars(nx * pull * MAX_SHIFT_PX, ny * pull * (MAX_SHIFT_PX * 0.5), nx * pull * MAX_TILT_DEG);
    }

    function onMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (frameRef.current != null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        settle();
      });
    }

    function reset() {
      pointerRef.current = null;
      writeVars(0, 0, 0);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', reset);
    document.addEventListener('pointerleave', reset);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', reset);
      document.removeEventListener('pointerleave', reset);
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      reset();
    };
  }, [enabled]);

  const onPointerDown = useCallback(() => {
    if (!enabled || prefersReducedMotion()) return;
    setHop(false);
    // Drop the class for a frame so the animation restarts on a rapid re-tap.
    window.requestAnimationFrame(() => setHop(true));
  }, [enabled]);

  const onAnimationEnd = useCallback(() => setHop(false), []);

  return { ref, hop, onPointerDown, onAnimationEnd };
}
