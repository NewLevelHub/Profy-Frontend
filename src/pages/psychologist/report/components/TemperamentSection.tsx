import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { TemperamentSection as TemperamentSectionData } from '@/shared/types';
import { ScatterPlot, type ScatterPlotQuadrant } from './ScatterPlot';

const EXTRAVERSION_LABELS: Record<string, string> = {
  deep_introvert: 'Глубокий интроверт',
  introvert: 'Интроверт',
  ambivert: 'Амбиверт',
  extravert: 'Экстраверт',
  bright_extravert: 'Яркий экстраверт',
};

const NEUROTICISM_LABELS: Record<string, string> = {
  low: 'Низкий (эмоц. устойчивость)',
  medium: 'Средний',
  high: 'Высокий',
  very_high: 'Очень высокий',
};

const QUADRANT_LABELS: Record<string, string> = {
  choleric: 'Холерик',
  sanguine: 'Сангвиник',
  phlegmatic: 'Флегматик',
  melancholic: 'Меланхолик',
};

// Both raw scales are 0-24 (Ф1.5: 24 keyed items each) — the Scatter
// Plot's own 4 quadrants split at the (12, 12) midpoint, independent from
// extraversion_level/neuroticism_level's finer 5-/4-band thresholds above.
const SCALE_MAX = 24;

// Screen layout matches the classic Eysenck personality circle: extraverts
// on the right, unstable (high neuroticism) on top.
const TOP_LEFT: ScatterPlotQuadrant = { key: 'melancholic', label: 'Меланхолик', color: 'var(--danger-bg)' };
const TOP_RIGHT: ScatterPlotQuadrant = { key: 'choleric', label: 'Холерик', color: 'var(--accent-soft)' };
const BOTTOM_LEFT: ScatterPlotQuadrant = { key: 'phlegmatic', label: 'Флегматик', color: 'var(--brand-subtle)' };
const BOTTOM_RIGHT: ScatterPlotQuadrant = { key: 'sanguine', label: 'Сангвиник', color: 'var(--bg-raised)' };

/** Eysenck EPI «Темперамент» — Scatter Plot (X=экстраверсия, Y=нейротизм),
 * 4 подписанных квадранта, точка респондента, плашка «протокол под
 * вопросом» при флаге шкалы лжи. PRO-338 Ф1.6
 * (02-Фаза1-Лёгкие-тесты.md §1.Б). No `ValiditySection.tsx` exists in this
 * branch to copy the "traffic light" pattern from verbatim (PRO-282's own
 * frontend isn't merged here) — this reuses this codebase's own existing
 * warning-banner visual language instead (`AdminError`'s
 * border-danger/bg-danger-subtle, same as validity's own pattern would be). */
export function TemperamentSection({ section }: { section: TemperamentSectionData | null }) {
  if (!section) return null;
  const hasChart = section.extraversion_raw !== null && section.neuroticism_raw !== null;

  return (
    <AdminCard title="Темперамент" description="Eysenck EPI (адапт. Шмелева)">
      {section.protocol_flagged && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle"
        >
          <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
            Протокол под вопросом — шкала лжи выше нормы, интерпретировать результаты с осторожностью.
          </p>
        </div>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <ScatterPlot
            x={section.extraversion_raw!}
            y={section.neuroticism_raw!}
            max={SCALE_MAX}
            quadrants={[TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT]}
            xLabel="Экстраверсия"
            yLabel="Нейротизм"
          />
          {section.quadrant && (
            <AdminBadge tone="brand">{QUADRANT_LABELS[section.quadrant] ?? section.quadrant}</AdminBadge>
          )}
        </div>
      )}

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {section.extraversion_raw !== null && (
          <li className="flex items-center justify-between gap-2">
            <span className={ADMIN_META}>Экстраверсия</span>
            <span className="flex items-center gap-2">
              <span className={ADMIN_NUM}>{section.extraversion_raw}/{SCALE_MAX}</span>
              {section.extraversion_level && (
                <AdminBadge tone="quiet">{EXTRAVERSION_LABELS[section.extraversion_level] ?? section.extraversion_level}</AdminBadge>
              )}
            </span>
          </li>
        )}
        {section.neuroticism_raw !== null && (
          <li className="flex items-center justify-between gap-2">
            <span className={ADMIN_META}>Нейротизм</span>
            <span className="flex items-center gap-2">
              <span className={ADMIN_NUM}>{section.neuroticism_raw}/{SCALE_MAX}</span>
              {section.neuroticism_level && (
                <AdminBadge tone="quiet">{NEUROTICISM_LABELS[section.neuroticism_level] ?? section.neuroticism_level}</AdminBadge>
              )}
            </span>
          </li>
        )}
        {section.lie_scale_raw !== null && (
          <li className="flex items-center justify-between gap-2">
            <span className={ADMIN_META}>Шкала лжи</span>
            <span className={ADMIN_NUM}>{section.lie_scale_raw}</span>
          </li>
        )}
      </ul>
    </AdminCard>
  );
}
