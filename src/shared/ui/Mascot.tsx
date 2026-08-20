import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  ALL_SPRITES,
  MASCOT_ASSET_BASE,
  type MascotEyeBox,
  type MascotState,
} from './mascot/sprites';

export type { MascotState, MascotFunctionalState, MascotProfessionState } from './mascot/sprites';
export { SPRITES, PRO } from './mascot/sprites';

export interface MascotProps {
  /** Which pose to render — 6 functional states (ТЗ 14.3) + 20 profession states (unwired, held for later). */
  state: MascotState;
  /** Rendered width in px. Defaults to 260 in full mode, 44 in compact mode. */
  size?: number;
  /** Circular avatar crop (zoomed on the head) instead of the full pose. Defaults to false. */
  compact?: boolean;
  /** Set false to opt out of the blink animation even outside reduced-motion. Defaults to true. */
  blink?: boolean;
  className?: string;
}

// Blink layer geometry — padding around each eye box, in % of the sprite image.
const PAD_X = 1.4;
const PAD_Y = 1.6;
// Mascot fur/ink colors — asset-specific, not semantic design tokens, so these
// are intentionally hardcoded rather than pulled from theme.css.
const EYELID_FILL = '#FDFDFB';
const EYELID_LINE = '#14201F';
// Fixed zoom factor for the compact circular avatar crop.
const ZOOM = 2.4;

const DEFAULT_SIZE_FULL = 260;
const DEFAULT_SIZE_COMPACT = 44;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Profy's mascot. Static pose sprite plus a lightweight blink overlay — body,
 * head, ears, paws and prop never animate, only the eyes.
 *
 * Ported 1:1 from the design team's approved reference (Profy Mascot.dc.html) —
 * see src/shared/ui/mascot/sprites.ts for the sprite/eye/head geometry this
 * reads from.
 *
 * Per ТЗ 29.2 this must never appear on the question screen itself, never
 * react to answer content, and never praise a specific choice — only on
 * rest/transition/loading/completion moments.
 */
export function Mascot({ state, size, compact = false, blink = true, className }: MascotProps) {
  const entry = ALL_SPRITES[state];
  const resolvedSize = size ?? (compact ? DEFAULT_SIZE_COMPACT : DEFAULT_SIZE_FULL);
  const [blinking, setBlinking] = useState(false);
  const timeoutIdsRef = useRef<number[]>([]);

  const canBlink = entry.eyes !== null && blink !== false && compact !== true;

  useEffect(() => {
    setBlinking(false);

    if (!canBlink || prefersReducedMotion()) {
      return;
    }

    const timeoutIds = timeoutIdsRef.current;

    function scheduleBlink(delayMs: number) {
      const openId = window.setTimeout(() => {
        setBlinking(true);
        const closeId = window.setTimeout(() => {
          setBlinking(false);
          const isQuickFollowUp = Math.random() < 0.18;
          scheduleBlink(
            isQuickFollowUp ? 260 + Math.random() * 180 : 2800 + Math.random() * 2600,
          );
        }, 110 + Math.random() * 60);
        timeoutIds.push(closeId);
      }, delayMs);
      timeoutIds.push(openId);
    }

    scheduleBlink(1200 + Math.random() * 2000);

    return () => {
      timeoutIds.forEach(id => window.clearTimeout(id));
      timeoutIds.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, canBlink]);

  const src = `${MASCOT_ASSET_BASE}${entry.file}`;

  if (compact) {
    const [headX, headY] = entry.head;
    return (
      <div
        className={cn('relative overflow-hidden rounded-full bg-surface border border-strong', className)}
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        <img
          src={src}
          alt={entry.alt}
          className="absolute max-w-none"
          style={{
            width: `${ZOOM * 100}%`,
            left: `calc(50% - ${headX * ZOOM}%)`,
            top: `calc(50% - ${headY * ZOOM}%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ width: resolvedSize }}>
      <img src={src} alt={entry.alt} className="block w-full h-auto" />
      {blinking && entry.eyes && (
        <>
          {entry.eyes.map((eye, index) => (
            <Eyelid key={index} box={eye} />
          ))}
        </>
      )}
    </div>
  );
}

function Eyelid({ box }: { box: MascotEyeBox }) {
  const [x, y, w, h] = box;
  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x - PAD_X}%`,
        top: `${y - PAD_Y}%`,
        width: `${w + PAD_X * 2}%`,
        height: `${h + PAD_Y * 2}%`,
        background: EYELID_FILL,
      }}
    >
      <div
        className="absolute"
        style={{ left: '6%', right: '6%', top: '44%', height: '7%', background: EYELID_LINE }}
      />
    </div>
  );
}
