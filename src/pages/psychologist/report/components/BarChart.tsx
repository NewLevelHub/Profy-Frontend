import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface BarChartItem {
  key: string;
  label: string;
  value: number;
  /** Bar fill — carries the group (dominant/supporting/avoidance/neutral),
   *  a plain CSS color/var(), same convention as ScatterPlot's quadrant colors. */
  color: string;
}

interface BarChartProps {
  /** Rendered top-to-bottom in the given order — this component doesn't
   *  sort, the caller already ranked the items (Ф2.5's role ranking). */
  items: BarChartItem[];
  max: number;
  ariaLabel?: string;
}

/**
 * Horizontal bar list, one row per item. Plain CSS width percentages, not
 * SVG — unlike ScatterPlot/RadarChart/GaugeChart (which need real 2D
 * geometry: points, polygons, arcs), a horizontal bar is just a width, and
 * CSS handles long Russian labels + text wrapping/truncation better than
 * SVG `<text>` would.
 */
function BarChartComponent({ items, max, ariaLabel }: BarChartProps) {
  const { t } = useTranslation('psychReport');
  return (
    <div
      className="flex flex-col gap-2"
      role="img"
      aria-label={ariaLabel ?? t('psychReport:charts.barAria')}
    >
      {items.map((item) => {
        const pct = max > 0 ? Math.max(0, Math.min(100, (item.value / max) * 100)) : 0;
        return (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="w-32 flex-shrink-0 text-body-sm text-secondary truncate"
              title={item.label}
            >
              {item.label}
            </span>
            <div className="flex-1 h-5 rounded-[6px] bg-raised overflow-hidden">
              <div
                className="h-full rounded-[6px] transition-[width]"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-8 flex-shrink-0 text-right text-mono-sm tabular-nums text-primary">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const BarChart = memo(BarChartComponent);
BarChart.displayName = 'BarChart';
