import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { IntelligenceSection as IntelligenceSectionData } from '@/shared/types';
import { LineChart, type LineChartPoint } from './LineChart';

// Порядок и максимумы 6 скорируемых субтестов (Ф3.5: лабильность и субтест
// 8 «Геометрические фигуры» — вне общего балла/графика намеренно, см.
// app/services/astur_scoring.py и Тикеты Ф3.5/Ф3.7). Максимумы — из
// scripts/astur_bank.py (item_count, для «Обобщение» ×2 т.к. шкала 0/1/2,
// для «Логические схемы» — сумма связей по всем 8 цепочкам).
const SUBTEST_ORDER = ['awareness', 'analogies', 'classification', 'generalization', 'logical_schemas', 'numeric_series'];

const SUBTEST_MAX: Record<string, number> = {
  awareness: 20,
  analogies: 16,
  classification: 12,
  generalization: 38,
  logical_schemas: 26,
  numeric_series: 15,
};

// Короткие подписи для оси графика — полные названия рвут вёрстку на 6
// точках (как и у Belbin/Кондаш ранее: короткая подпись на графике, полное
// имя — в легенде/списке под ним).
const SUBTEST_SHORT_LABELS: Record<string, string> = {
  awareness: 'Осведомл.',
  analogies: 'Аналогии',
  classification: 'Классиф.',
  generalization: 'Обобщение',
  logical_schemas: 'Лог. схемы',
  numeric_series: 'Числ. ряды',
};

const SUBTEST_FULL_LABELS: Record<string, string> = {
  awareness: 'Осведомлённость',
  analogies: 'Двойные аналогии',
  classification: 'Классификации',
  generalization: 'Обобщение',
  logical_schemas: 'Логические схемы',
  numeric_series: 'Числовые ряды',
};

const SUBJECT_LABELS: Record<string, string> = {
  humanities: 'Гуманитарный',
  physics_math: 'Физико-математический',
  natural_science: 'Естественнонаучный',
};

/** АСТУР «Характеристики интеллекта» — линейный график по 6 скорируемым
 *  субтестам + СПН-группа + рекомендуемый профиль обучения (с долями).
 *  Лабильность (умственная работоспособность) — отдельный блок, вне
 *  общего графика (Ф3.7, 04-Фаза3-АСТУР.md). */
export function IntelligenceSection({ section }: { section: IntelligenceSectionData | null }) {
  if (!section) return null;
  const {
    raw_score, subtest_scores, spn_group, learning_profile, learning_profile_shares,
    lability_first_half_accuracy, lability_second_half_accuracy, lability_fatigue_signal,
  } = section;

  const points: LineChartPoint[] | null = subtest_scores
    ? SUBTEST_ORDER.filter((key) => key in subtest_scores).map((key) => ({
        key,
        label: SUBTEST_SHORT_LABELS[key],
        value: subtest_scores[key],
        max: SUBTEST_MAX[key],
      }))
    : null;

  return (
    <AdminCard title="Характеристики интеллекта" description="АСТУР (ПИ РАО, 1995)">
      {points && points.length > 0 && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <LineChart points={points} />
          <div className="flex items-center gap-3">
            {raw_score !== null && (
              <span className={cn(ADMIN_NUM, 'text-primary')}>Общий балл: {raw_score}/127</span>
            )}
            {spn_group !== null && <AdminBadge tone="brand">СПН-группа {spn_group}/5</AdminBadge>}
          </div>
          <ul className="m-0 p-0 list-none flex flex-col gap-1 w-full max-w-[280px]">
            {points.map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-2">
                <span className={ADMIN_META}>{SUBTEST_FULL_LABELS[p.key]}</span>
                <span className={ADMIN_NUM}>{p.value}/{p.max}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {learning_profile && (
        <div className="pt-3 border-t border-default mb-4">
          <p className={cn(ADMIN_TEXT, 'text-secondary mb-2')}>
            Рекомендуемый профиль обучения:{' '}
            <span className="font-semibold text-primary">{SUBJECT_LABELS[learning_profile] ?? learning_profile}</span>
          </p>
          {learning_profile_shares && (
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {Object.entries(learning_profile_shares).map(([subject, share]) => (
                <li key={subject} className="flex items-center gap-2">
                  <span className={cn(ADMIN_META, 'w-40 flex-shrink-0')}>{SUBJECT_LABELS[subject] ?? subject}</span>
                  <ProgressBar value={share * 100} className="flex-1" />
                  <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(share * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(lability_first_half_accuracy !== null || lability_second_half_accuracy !== null) && (
        <div className="pt-3 border-t border-default">
          <p className={cn(ADMIN_TEXT, 'text-secondary mb-2')}>Умственная работоспособность (лабильность)</p>
          {lability_fatigue_signal && (
            <div role="alert" className="flex items-start gap-3 p-3 mb-3 rounded-[14px] border border-danger bg-danger-subtle">
              <AlertTriangle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className={cn(ADMIN_TEXT, 'text-danger font-semibold m-0')}>
                Точность упала более чем на 25% между половинами блока — возможный признак умственной утомляемости.
              </p>
            </div>
          )}
          <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
            {lability_first_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-32 flex-shrink-0')}>1-я половина</span>
                <ProgressBar value={lability_first_half_accuracy * 100} className="flex-1" />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_first_half_accuracy * 100)}%</span>
              </li>
            )}
            {lability_second_half_accuracy !== null && (
              <li className="flex items-center gap-2">
                <span className={cn(ADMIN_META, 'w-32 flex-shrink-0')}>2-я половина</span>
                <ProgressBar
                  value={lability_second_half_accuracy * 100}
                  variant={lability_fatigue_signal ? 'accent' : 'brand'}
                  className="flex-1"
                />
                <span className={cn(ADMIN_NUM, 'w-10 text-right')}>{Math.round(lability_second_half_accuracy * 100)}%</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </AdminCard>
  );
}
