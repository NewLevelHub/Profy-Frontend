import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import {
  ALL_SPRITES,
  MASCOT_ASSET_BASE,
  type MascotEyeBox,
  type MascotState,
} from './mascot/sprites';
import { useMascotInteraction } from './mascot/useMascotInteraction';

export type { MascotState, MascotFunctionalState, MascotProfessionState } from './mascot/sprites';
export { SPRITES, PRO } from './mascot/sprites';

export interface MascotProps {
  /** Which pose to render — 6 functional states (ТЗ 14.3) + 20 profession states (unwired, held for later). */
  state: MascotState;
  /**
   * Rendered width. A number is taken as px; a string is passed to CSS as-is,
   * so fluid values like `clamp(240px, 34vw, 410px)` work — the landing sizes
   * its mascots against the viewport, not in fixed steps.
   * Defaults to 260 in full mode, 44 in compact mode.
   */
  size?: number | string;
  /** Circular avatar crop (zoomed on the head) instead of the full pose. Defaults to false. */
  compact?: boolean;
  /** Set false to opt out of the blink animation even outside reduced-motion. Defaults to true. */
  blink?: boolean;
  /**
   * Opt in to the interactive layer: idle "breathing" loop, a lean toward the
   * pointer while it's near, and a squash-and-stretch hop on tap. Transform-only,
   * fine-pointer only, and disabled under `prefers-reduced-motion`. Ignored in
   * `compact` mode. Off by default — only turn it on for rare/"significant"
   * moments (welcome, completion), not routine content-swap poses. Don't combine
   * with a `className` that also sets `transform` (e.g. `-scale-x-100`).
   */
  interactive?: boolean;
  /**
   * Play a one-shot celebratory bounce when the mascot mounts (on top of the
   * usual landing). For genuine "significant moment" poses only — the
   * `completion`/medal reveal after finishing the assessment — per DESIGN.md's
   * "rare + significant → more personality" rule. Transform-only, collapses
   * under `prefers-reduced-motion`. Independent of `interactive`.
   */
  celebrate?: boolean;
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
export function Mascot({
  state,
  size,
  compact = false,
  blink = true,
  interactive = false,
  celebrate = false,
  className,
}: MascotProps) {
  const { t } = useTranslation('common');
  const entry = ALL_SPRITES[state];
  const alt = t(entry.alt);
  const resolvedSize = size ?? (compact ? DEFAULT_SIZE_COMPACT : DEFAULT_SIZE_FULL);
  const [blinking, setBlinking] = useState(false);
  const timeoutIdsRef = useRef<number[]>([]);

  const interactionEnabled = interactive && !compact;
  const interaction = useMascotInteraction(interactionEnabled);

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
          alt={alt}
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

  const canCelebrate = celebrate && !compact && !prefersReducedMotion();

  const poseLayer = (
    <>
      <img src={src} alt={alt} className="mascot-sprite block w-full h-auto" />
      {blinking && entry.eyes && entry.eyes.map((eye, index) => <Eyelid key={index} box={eye} />)}
    </>
  );

  // One-shot celebration wraps the pose closest to the sprite so it composes
  // with the (subtle, always-on) breath above it rather than replacing it.
  const inner = canCelebrate ? <div className="mascot-cheer">{poseLayer}</div> : poseLayer;

  return (
    <div className={cn('relative', className)} style={{ width: resolvedSize }}>
      {/* Появление — отдельный слой поверх всех остальных: снаружи className
          может задавать свой transform (-scale-x-100 в IdentityRail), внутри
          за transform спорят lean/gesture/breath/hop. Собственная обёртка на
          каждый слой разводит их. */}
      <div className="mascot-enter">
        {interactionEnabled ? (
          <div ref={interaction.ref} className="mascot-lean" onPointerDown={interaction.onPointerDown}>
            <div className={cn('mascot-gesture', interaction.gesture && `mascot-${interaction.gesture}`)}>
              <div
                className={cn('mascot-breath', interaction.hop && 'mascot-hop')}
                onAnimationEnd={interaction.onAnimationEnd}
              >
                {inner}
              </div>
            </div>
          </div>
        ) : (
          inner
        )}
      </div>
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
