import { memo } from 'react';

export interface LineChartPoint {
  key: string;
  label: string;
  value: number;
  max: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  width?: number;
  height?: number;
}

const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

/**
 * Generic line/profile chart: N points evenly spaced on X, each normalized
 * to its OWN max (0-100%) on Y — subtests have very different raw scales
 * (12 vs 38), a shared 0-100% axis is what makes them comparable at a
 * glance. Hand-rolled SVG, no chart library in this project (checked
 * before RadarChart.tsx, same call here).
 */
function LineChartComponent({ points, width = 560, height = 250 }: LineChartProps) {
  const padLeft = 40;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 44;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const count = points.length;

  const xFor = (i: number) => (count <= 1 ? padLeft + plotW / 2 : padLeft + (i / (count - 1)) * plotW);
  const yFor = (fraction: number) => padTop + plotH - fraction * plotH;

  const coords = points.map((p, i) => ({
    x: xFor(i),
    y: yFor(p.max > 0 ? Math.max(0, Math.min(1, p.value / p.max)) : 0),
  }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Профиль по субтестам">
      {GRID_FRACTIONS.map((fraction) => (
        <line
          key={fraction}
          x1={padLeft} x2={width - padRight}
          y1={yFor(fraction)} y2={yFor(fraction)}
          stroke="var(--border)" strokeWidth={1}
        />
      ))}
      <text x={padLeft - 10} y={yFor(1)} textAnchor="end" dominantBaseline="middle" style={{ fontSize: 12, fontFamily: 'var(--font-sans)', fill: 'var(--text-secondary)' }}>100%</text>
      <text x={padLeft - 10} y={yFor(0)} textAnchor="end" dominantBaseline="middle" style={{ fontSize: 12, fontFamily: 'var(--font-sans)', fill: 'var(--text-secondary)' }}>0%</text>

      <path d={path} fill="none" stroke="var(--brand)" strokeWidth={2.5} />

      {coords.map((c, i) => (
        <g key={points[i].key}>
          <circle cx={c.x} cy={c.y} r={5} fill="var(--brand)" stroke="var(--paper)" strokeWidth={2} />
          <text x={c.x} y={c.y - 14} textAnchor="middle" style={{ fontSize: 13, fontFamily: 'var(--font-sans)', fill: 'var(--text-primary)', fontWeight: 700 }}>
            {points[i].value}/{points[i].max}
          </text>
          <text x={c.x} y={height - padBottom + 22} textAnchor="middle" style={{ fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500, fill: 'var(--text-secondary)' }}>
            {points[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export const LineChart = memo(LineChartComponent);
LineChart.displayName = 'LineChart';
