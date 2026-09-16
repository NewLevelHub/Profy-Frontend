import { memo } from 'react';

export interface GaugeChartSegment {
  /** This segment covers the range up to (and including) this raw value —
   *  segments must be given in ascending order, the last one implicitly
   *  extends to `max`. */
  upTo: number;
  color: string;
}

interface GaugeChartProps {
  value: number;
  max: number;
  segments: GaugeChartSegment[];
  size?: number;
}

const START_ANGLE = -Math.PI; // pointing left
const END_ANGLE = 0; // pointing right

function angleFor(fraction: number) {
  return START_ANGLE + Math.max(0, Math.min(1, fraction)) * (END_ANGLE - START_ANGLE);
}

function pointOnArc(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function wedgePath(cx: number, cy: number, r: number, fromAngle: number, toAngle: number) {
  const from = pointOnArc(cx, cy, r, fromAngle);
  const to = pointOnArc(cx, cy, r, toAngle);
  return `M ${cx} ${cy} L ${from.x} ${from.y} A ${r} ${r} 0 0 1 ${to.x} ${to.y} Z`;
}

/**
 * Half-circle (180°) gauge/speedometer, one needle, N colored segments.
 * Hand-rolled SVG — same call as RadarChart.tsx/ScatterPlot.tsx (no chart
 * library in this project, checked `package.json` before building any of
 * the three).
 */
function GaugeChartComponent({ value, max, segments, size = 240 }: GaugeChartProps) {
  const cx = size / 2;
  const cy = size / 2 + 4;
  const r = size / 2 - 20;
  const needleLength = r - 10;

  let previousBound = 0;
  const wedges = segments.map((segment) => {
    const from = angleFor(previousBound / max);
    const to = angleFor(segment.upTo / max);
    previousBound = segment.upTo;
    return { ...segment, from, to };
  });

  const needleAngle = angleFor(value / max);
  const needleTip = pointOnArc(cx, cy, needleLength, needleAngle);

  return (
    <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`} role="img" aria-label="Шкала уровня притязаний">
      {wedges.map((w) => (
        <path key={w.upTo} d={wedgePath(cx, cy, r, w.from, w.to)} fill={w.color} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={1} />

      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="var(--text-primary)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="var(--text-primary)" />
    </svg>
  );
}

export const GaugeChart = memo(GaugeChartComponent);
GaugeChart.displayName = 'GaugeChart';
