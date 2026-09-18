import { memo } from 'react';

export interface PolarAreaSector {
  key: string;
  label: string;
  value: number;
}

interface PolarAreaChartProps {
  sectors: PolarAreaSector[];
  /** Shared per-sector max (Бойко: 6 баллов на канал) — one scale for every
   *  wedge, not normalized per-sector, so radius stays comparable across
   *  channels at a glance. */
  max: number;
  size?: number;
}

const RING_FRACTIONS = [1 / 3, 2 / 3, 1];
// Small angular gap between wedges — the polar-area equivalent of a surface
// gap between adjacent filled marks (dataviz skill, mark spacing).
const GAP_RADIANS = (2 * Math.PI) / 180; // 2°

function pointAt(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function wedgePath(cx: number, cy: number, r: number, fromAngle: number, toAngle: number) {
  if (r <= 0) return '';
  const from = pointAt(cx, cy, r, fromAngle);
  const to = pointAt(cx, cy, r, toAngle);
  const largeArc = toAngle - fromAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${from.x} ${from.y} A ${r} ${r} 0 ${largeArc} 1 ${to.x} ${to.y} Z`;
}

/**
 * Polar area / "Nightingale rose" chart: N equal-angle wedges, each wedge's
 * RADIUS (not color) encodes its own value against a shared max — unlike
 * RadarChart's one connected polygon across axes, every category here is an
 * independent filled sector, closer to a bar chart wrapped around a circle.
 * One hue (magnitude is the job, not identity — every sector already carries
 * its own position + label, so a 6-color categorical palette would encode
 * nothing color alone doesn't already say) — hand-rolled SVG, no chart
 * library in this project (checked package.json before RadarChart.tsx).
 */
function PolarAreaChartComponent({ sectors, max, size = 300 }: PolarAreaChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 50; // room for labels outside the wedges
  const count = sectors.length;
  const angleStep = (2 * Math.PI) / count;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Диаграмма каналов эмпатии">
      {RING_FRACTIONS.map((fraction) => (
        <circle key={fraction} cx={cx} cy={cy} r={outerR * fraction} fill="none" stroke="var(--border)" strokeWidth={1} />
      ))}

      {sectors.map((sector, i) => {
        const fraction = max > 0 ? Math.max(0, Math.min(1, sector.value / max)) : 0;
        const from = -Math.PI / 2 + i * angleStep + GAP_RADIANS / 2;
        const to = -Math.PI / 2 + (i + 1) * angleStep - GAP_RADIANS / 2;
        return (
          <path
            key={sector.key}
            d={wedgePath(cx, cy, outerR * fraction, from, to)}
            fill="var(--brand)"
            fillOpacity={0.55}
            stroke="var(--brand)"
            strokeWidth={1.5}
          />
        );
      })}

      {sectors.map((sector, i) => {
        const mid = -Math.PI / 2 + (i + 0.5) * angleStep;
        const labelPoint = pointAt(cx, cy, outerR + 20, mid);
        return (
          <text
            key={sector.key}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, fill: 'var(--text-secondary)' }}
          >
            {sector.label}
          </text>
        );
      })}
    </svg>
  );
}

export const PolarAreaChart = memo(PolarAreaChartComponent);
PolarAreaChart.displayName = 'PolarAreaChart';
