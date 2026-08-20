import { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * "Спина ясности" (spine of clarity) — the single reusable progress visual
 * for the whole product: one horizontal line with milestone nodes, replacing
 * every ad-hoc progress bar / dot-timeline.
 *
 * Two modes:
 *  - Discrete (`nodes`): an explicit milestone list — "Блок 3 из 6",
 *    roadmap horizons, generation steps. Each node carries its own status.
 *  - Continuous (`value`): a single 0–100 fill, for free-running progress
 *    like "question 7 of 20" where individual questions aren't milestones.
 *
 * Parameters map directly to the product spec: thickness (`thickness`),
 * length (controlled by the parent's width — the component is `w-full`),
 * node position (`node.position`, or evenly distributed by default), and
 * filled/dashed segments (auto-computed from node status, or overridden per
 * node via `node.segment`).
 */

export type SpineNodeStatus = 'done' | 'current' | 'upcoming';
export type SpineSegmentStyle = 'filled' | 'dashed' | 'dashed-heavy' | 'none' | 'track';

export interface SpineNode {
  /** Stable key for the node. */
  id: string | number;
  status: SpineNodeStatus;
  /** Optional caption rendered under the node when `showLabels` is set. */
  label?: string;
  /**
   * Marks this node as the journey's endpoint ("цель") — always renders
   * larger and pine-filled regardless of `status`, unless `goalStyle` is
   * `'open'`.
   */
  goal?: boolean;
  /**
   * `'open'` renders the goal node at full goal size but unfilled/hairline
   * instead of solid pine — for open-ended journeys with no fixed finish
   * line (e.g. the explore-scenario roadmap on /results, which deliberately
   * has no "цель" to land on). Ignored unless `goal` is set. Defaults to
   * `'filled'`.
   */
  goalStyle?: 'filled' | 'open';
  /** Explicit position along the line, 0–100. Omit to distribute nodes evenly. */
  position?: number;
  /**
   * Override the auto-computed style of the segment leading INTO this node
   * from the previous one. Ignored on the first node (nothing precedes it).
   */
  segment?: SpineSegmentStyle;
  /**
   * Renders the node's own ring as a dashed stroke instead of solid —
   * used to mark a node as conditional/optional (e.g. the onboarding
   * overview map's post-diagnostic interstitial node). Ignored on filled
   * nodes (goal / done / current all render solid regardless). Defaults
   * to `'solid'`.
   */
  strokeStyle?: 'solid' | 'dashed';
  /** Override the label's color (css value). Defaults to `var(--mute)`. */
  labelColor?: string;
  /** Optional second caption line under `label`, rendered smaller/muted — for maps that need a one-line description per milestone, not just a title. */
  description?: string;
  /**
   * Set false to keep the node's position/status in the layout and segment
   * math but not draw its dot — e.g. an anchor at position 0 that exists
   * only to give the first real node a lead-in segment (auth register spine:
   * a short solid-pine stub before the "current" node), or a trailing anchor
   * at position 100 that exists only to extend the dashed track past the
   * last visible node (auth login spine: a single dot with a full-width
   * dashed track continuing past it). Defaults to true.
   */
  visible?: boolean;
}

export interface SpineProps {
  /** Discrete milestone mode — an array of nodes with per-node status. */
  nodes?: SpineNode[];
  /**
   * Continuous mode — 0–100 fill percentage, used when `nodes` is omitted.
   * Renders a solid fill up to `value` with a "current" marker at the edge
   * and a "goal" marker fixed at 100%.
   */
  value?: number;
  /**
   * Line + node scale multiplier. 1 = full-size (assessment header, roadmap
   * overview). The admin table's inline row indicator uses 0.75 per spec.
   */
  thickness?: number;
  /** Render `node.label` captions beneath the line (discrete mode only). */
  showLabels?: boolean;
  ariaLabel?: string;
  className?: string;
  /**
   * Continuous mode only. Renders a plain two-tone line — solid pine/green
   * fill up to `value`, solid neutral track for the remainder — with no
   * current/goal node markers and no dashing. For headers where progress
   * should read as "how far through," not "where's the next milestone."
   */
  flat?: boolean;
}

const LINE_H = 3; // px, thickness = 1

const DIAMETER = {
  upcoming: 10,
  done: 11,
  current: 14,
  goal: 18,
} as const;

interface ResolvedNode {
  id: string | number;
  position: number; // 0–100
  diameter: number;
  filled: boolean;
  color: string; // css var()
  /** Style of the segment leading into this node (unused for index 0). */
  segment: SpineSegmentStyle;
  strokeStyle: 'solid' | 'dashed';
  label?: string;
  labelColor?: string;
  description?: string;
}

function nodeVisual(
  status: SpineNodeStatus,
  goal: boolean | undefined,
  thickness: number,
  goalStyle: 'filled' | 'open' = 'filled',
) {
  if (goal) {
    return goalStyle === 'open'
      ? { diameter: DIAMETER.goal * thickness, filled: false, color: 'var(--mute)' }
      : { diameter: DIAMETER.goal * thickness, filled: true, color: 'var(--pine)' };
  }
  switch (status) {
    case 'done':
      return { diameter: DIAMETER.done * thickness, filled: true, color: 'var(--pine)' };
    case 'current':
      return { diameter: DIAMETER.current * thickness, filled: true, color: 'var(--dawn)' };
    case 'upcoming':
    default:
      return { diameter: DIAMETER.upcoming * thickness, filled: false, color: 'var(--hairline)' };
  }
}

function autoSegment(prevStatus: SpineNodeStatus, curr: SpineNode): SpineSegmentStyle {
  if (curr.segment) return curr.segment;
  if (curr.status === 'done' || curr.status === 'current') return 'filled';
  // curr.status === 'upcoming': heavier dash right after leaving done/current
  // territory (still "in progress"), lighter dash once further out.
  return prevStatus !== 'upcoming' ? 'dashed-heavy' : 'dashed';
}

function resolveDiscreteNodes(nodes: SpineNode[], thickness: number): ResolvedNode[] {
  const count = nodes.length;
  return nodes.map((node, i) => {
    const position = node.position ?? (count === 1 ? 0 : (i / (count - 1)) * 100);
    const visual = nodeVisual(node.status, node.goal, thickness, node.goalStyle);
    const segment = i === 0 ? 'filled' : autoSegment(nodes[i - 1].status, node);
    const diameter = node.visible === false ? 0 : visual.diameter;
    return {
      id: node.id, position, ...visual, diameter, segment,
      strokeStyle: node.strokeStyle ?? 'solid',
      label: node.label, labelColor: node.labelColor, description: node.description,
    };
  });
}

function resolveContinuousNodes(value: number, thickness: number, flat: boolean): ResolvedNode[] {
  const clamped = Math.max(0, Math.min(100, value));
  const anchor: ResolvedNode = {
    id: 'start', position: 0, diameter: 0, filled: true, color: 'var(--pine)', segment: 'filled', strokeStyle: 'solid',
  };

  if (flat) {
    // No node markers (all diameters 0 — filled nodes render without a
    // border regardless, so they stay fully invisible) and no dashing —
    // just the two-tone line itself.
    return [
      anchor,
      { id: 'progress', position: clamped, diameter: 0, filled: true, color: 'var(--pine)', segment: 'filled', strokeStyle: 'solid' },
      { id: 'end', position: 100, diameter: 0, filled: true, color: 'var(--hairline)', segment: 'track', strokeStyle: 'solid' },
    ];
  }

  const goalVisual = nodeVisual('upcoming', true, thickness);

  if (clamped >= 100) {
    return [anchor, { id: 'goal', position: 100, ...goalVisual, segment: 'filled', strokeStyle: 'solid' }];
  }

  const currentVisual = nodeVisual('current', false, thickness);
  return [
    anchor,
    { id: 'current', position: clamped, ...currentVisual, segment: 'filled', strokeStyle: 'solid' },
    { id: 'goal', position: 100, ...goalVisual, segment: 'dashed', strokeStyle: 'solid' },
  ];
}

function segmentStyle(style: SpineSegmentStyle): CSSProperties {
  switch (style) {
    case 'filled':
      return { background: 'var(--pine)' };
    case 'none':
      // Deliberate break in the track — e.g. the onboarding overview map's
      // gap between step 4 and the post-diagnostic node 5, representing the
      // diagnostic quiz happening in between (not "part of" the linear flow).
      return { background: 'transparent' };
    case 'dashed-heavy':
      return {
        backgroundImage:
          'repeating-linear-gradient(to right, var(--mute) 0, var(--mute) 6px, transparent 6px, transparent 11px)',
      };
    case 'track':
      return { background: 'var(--hairline)' };
    case 'dashed':
    default:
      return {
        backgroundImage:
          'repeating-linear-gradient(to right, var(--hairline) 0, var(--hairline) 2px, transparent 2px, transparent 9px)',
      };
  }
}

export function Spine({ nodes, value, thickness = 1, showLabels = false, ariaLabel, className, flat = false }: SpineProps) {
  const resolved = nodes ? resolveDiscreteNodes(nodes, thickness) : resolveContinuousNodes(value ?? 0, thickness, flat);
  const lineH = LINE_H * thickness;
  const trackHeight = Math.max(lineH, ...resolved.map((n) => n.diameter));

  const progressProps = nodes
    ? { role: 'img' as const }
    : {
        role: 'progressbar' as const,
        'aria-valuenow': Math.round(Math.max(0, Math.min(100, value ?? 0))),
        'aria-valuemin': 0,
        'aria-valuemax': 100,
      };

  return (
    <div className={cn('w-full', className)} aria-label={ariaLabel} {...progressProps}>
      <div className="relative w-full" style={{ height: trackHeight }}>
        {/* Track */}
        <div
          className="absolute left-0 right-0 flex overflow-hidden"
          style={{
            top: '50%',
            height: lineH,
            transform: 'translateY(-50%)',
            borderRadius: flat ? lineH : 0,
          }}
        >
          {resolved.slice(1).map((n, i) => (
            <span
              key={`seg-${n.id}`}
              aria-hidden="true"
              className="block h-full"
              style={{ flexGrow: Math.max(n.position - resolved[i].position, 0.0001), ...segmentStyle(n.segment) }}
            />
          ))}
        </div>

        {/* Nodes */}
        {resolved.map((n) => (
          <span
            key={n.id}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{
              left: `${n.position}%`,
              top: '50%',
              width: n.diameter,
              height: n.diameter,
              transform: 'translate(-50%, -50%)',
              background: n.filled ? n.color : 'var(--bg-surface)',
              border: n.filled ? 'none' : `${Math.max(1.5 * thickness, 1)}px ${n.strokeStyle} ${n.color}`,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      {showLabels && nodes && (
        <>
          {/* Below sm: the sm+ layout below positions each caption by
             absolute percentage with `whitespace-nowrap`, which has no
             collision avoidance — with enough nodes/longer captions
             (e.g. "1 ГОД" next to "ДО ПОСТУПЛЕНИЯ") they overlap at narrow
             widths. A plain wrapped list keeps every caption fully legible;
             it trades exact x-alignment to its node for that, an acceptable
             swap at this size. */}
          <div className="sm:hidden mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {resolved.map((n) =>
              n.label ? (
                <div key={`lbl-m-${n.id}`}>
                  <span
                    className="block font-mono text-tiny font-semibold"
                    style={{ color: n.labelColor ?? 'var(--mute)' }}
                  >
                    {n.label}
                  </span>
                  {n.description && (
                    <span className="block text-tiny text-muted mt-0.5">
                      {n.description}
                    </span>
                  )}
                </div>
              ) : null,
            )}
          </div>

          <div
            className="hidden sm:block relative w-full mt-2"
            style={{ height: resolved.some(n => n.description) ? 48 : 16 }}
          >
            {resolved.map((n) =>
              n.label ? (
                <div
                  key={`lbl-${n.id}`}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: `${n.position}%`,
                    transform: n.position >= 100 ? 'translateX(-100%)' : n.position <= 0 ? 'translateX(0)' : 'translateX(-50%)',
                  }}
                >
                  <span
                    className="block font-mono text-tiny font-semibold"
                    style={{ color: n.labelColor ?? 'var(--mute)' }}
                  >
                    {n.label}
                  </span>
                  {n.description && (
                    <span className="block text-tiny text-muted whitespace-normal max-w-[140px] mt-0.5">
                      {n.description}
                    </span>
                  )}
                </div>
              ) : null,
            )}
          </div>
        </>
      )}
    </div>
  );
}
