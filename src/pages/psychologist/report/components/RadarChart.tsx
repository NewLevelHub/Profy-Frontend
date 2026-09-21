import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface RadarChartAxis {
  key: string;
  label: string;
}

export interface RadarChartSeries {
  key: string;
  label: string;
  /** CSS color (theme token, e.g. `var(--brand)`) — stroke + translucent fill. */
  color: string;
  /** Raw value per axis key. Missing/undefined axis reads as 0. */
  values: Record<string, number>;
  /** This series' own achievable max — each series is normalized against its
   *  own max, not a shared one, so two differently-scaled instruments (e.g.
   *  0-8 interests vs 0-3 abilities) still overlay as comparable proportions. */
  max: number;
}

interface RadarChartProps {
  axes: RadarChartAxis[];
  series: RadarChartSeries[];
  size?: number;
  ariaLabel?: string;
}

const RING_FRACTIONS = [0.25, 0.5, 0.75, 1];

function pointOnAxis(index: number, count: number, fraction: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return {
    x: center + radius * fraction * Math.cos(angle),
    y: center + radius * fraction * Math.sin(angle),
  };
}

/**
 * Generic N-axis radar/spider chart, multiple overlaid series. No chart
 * library in this project (`package.json` — checked before building this):
 * a hand-rolled SVG keeps the bundle light for a component this small and
 * used on one specialist-only screen.
 */
function RadarChartComponent({ axes, series, size = 280, ariaLabel }: RadarChartProps) {
  const { t } = useTranslation('psychReport');
  const center = size / 2;
  const radius = size / 2 - 46; // leave room for axis labels outside the plot
  const count = axes.length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel ?? t('psychReport:charts.radarAria')}
    >
      {RING_FRACTIONS.map((fraction) => {
        const points = axes.map((_, i) => pointOnAxis(i, count, fraction, radius, center));
        return (
          <polygon
            key={fraction}
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}

      {axes.map((axis, i) => {
        const edge = pointOnAxis(i, count, 1, radius, center);
        const labelPoint = pointOnAxis(i, count, 1.16, radius, center);
        return (
          <g key={axis.key}>
            <line x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="var(--border)" strokeWidth={1} />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, fill: 'var(--text-secondary)' }}
            >
              {axis.label}
            </text>
          </g>
        );
      })}

      {series.map((s) => {
        const points = axes.map((axis, i) => {
          const raw = s.values[axis.key] ?? 0;
          const fraction = s.max > 0 ? Math.max(0, Math.min(1, raw / s.max)) : 0;
          return pointOnAxis(i, count, fraction, radius, center);
        });
        return (
          <polygon
            key={s.key}
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={s.color}
            fillOpacity={0.18}
            stroke={s.color}
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

export const RadarChart = memo(RadarChartComponent);
RadarChart.displayName = 'RadarChart';
