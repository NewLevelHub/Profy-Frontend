import { memo } from 'react';

export interface ScatterPlotQuadrant {
  key: string;
  label: string;
  /** SVG fill, e.g. `var(--danger-bg)` — a quadrant background tint. */
  color: string;
}

interface ScatterPlotProps {
  /** Raw 0-max value, plotted left (0) to right (max). */
  x: number;
  /** Raw 0-max value, plotted bottom (0) to top (max) — SVG y is flipped. */
  y: number;
  max: number;
  /** [top-left, top-right, bottom-left, bottom-right] — screen reading
   *  order, matching how the 4 quadrants sit around the (max/2, max/2)
   *  midpoint. */
  quadrants: [ScatterPlotQuadrant, ScatterPlotQuadrant, ScatterPlotQuadrant, ScatterPlotQuadrant];
  xLabel: string;
  yLabel: string;
  size?: number;
}

/**
 * Generic 2-axis scatter plot, one point, 4 labeled quadrant backgrounds
 * split at the midpoint of both axes. Hand-rolled SVG, no chart library —
 * same call as RadarChart.tsx (checked package.json first; nothing this
 * small is worth a dependency).
 */
function ScatterPlotComponent({ x, y, max, quadrants, xLabel, yLabel, size = 240 }: ScatterPlotProps) {
  const pad = 34;
  const plot = size - pad * 2;
  const half = plot / 2;
  const mid = pad + half;
  const clamp = (v: number) => Math.max(0, Math.min(max, v));
  const px = pad + (clamp(x) / max) * plot;
  const py = pad + plot - (clamp(y) / max) * plot; // SVG y grows downward

  const [topLeft, topRight, bottomLeft, bottomRight] = quadrants;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Координатная сетка темперамента">
      <rect x={pad} y={pad} width={half} height={half} fill={topLeft.color} />
      <rect x={mid} y={pad} width={half} height={half} fill={topRight.color} />
      <rect x={pad} y={mid} width={half} height={half} fill={bottomLeft.color} />
      <rect x={mid} y={mid} width={half} height={half} fill={bottomRight.color} />

      <rect x={pad} y={pad} width={plot} height={plot} fill="none" stroke="var(--border)" strokeWidth={1} />
      <line x1={mid} y1={pad} x2={mid} y2={pad + plot} stroke="var(--border)" strokeWidth={1} />
      <line x1={pad} y1={mid} x2={pad + plot} y2={mid} stroke="var(--border)" strokeWidth={1} />

      <text x={pad + plot} y={size - 6} textAnchor="end" style={{ fontSize: 10, fill: 'var(--text-secondary)' }}>
        {xLabel}
      </text>
      <text
        x={10}
        y={pad - 8}
        textAnchor="start"
        style={{ fontSize: 10, fill: 'var(--text-secondary)' }}
      >
        {yLabel}
      </text>

      <circle cx={px} cy={py} r={7} fill="var(--brand)" stroke="var(--paper)" strokeWidth={2} />

      {/* Labels render LAST (on top of the point) and carry a `--paper`
          halo (paintOrder="stroke") — the respondent's point can legally
          land anywhere in its quadrant, including a corner, so staying
          legible when it does is more important than never touching it. */}
      {([
        [topLeft, pad + 8, pad + 14, 'start'],
        [topRight, pad + plot - 8, pad + 14, 'end'],
        [bottomLeft, pad + 8, pad + plot - 8, 'start'],
        [bottomRight, pad + plot - 8, pad + plot - 8, 'end'],
      ] as const).map(([q, qx, qy, anchor]) => (
        <text
          key={q.key}
          x={qx}
          y={qy}
          textAnchor={anchor}
          style={{
            fontSize: 11,
            fontWeight: 600,
            fill: 'var(--text-secondary)',
            stroke: 'var(--paper)',
            strokeWidth: 3,
            paintOrder: 'stroke',
          }}
        >
          {q.label}
        </text>
      ))}
    </svg>
  );
}

export const ScatterPlot = memo(ScatterPlotComponent);
ScatterPlot.displayName = 'ScatterPlot';
