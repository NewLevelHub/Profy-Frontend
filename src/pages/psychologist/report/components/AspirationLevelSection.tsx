import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM } from '@/shared/ui/admin/density';
import type { AspirationLevelSection as AspirationLevelSectionData } from '@/shared/types';
import { GaugeChart, type GaugeChartSegment } from './GaugeChart';

const LEVEL_LABELS: Record<string, string> = {
  low: 'Низкая мотивация',
  medium: 'Средняя мотивация',
  moderately_high: 'Умеренно высокая — позитивный маркер',
  too_high: 'Слишком высокая — риск выгорания',
};

const LEVEL_TONES: Record<string, AdminBadgeTone> = {
  low: 'quiet',
  medium: 'quiet',
  moderately_high: 'brand',
  too_high: 'danger',
};

// Ф1.8 бэнды (app/data/elers_thresholds.json): 1-10 низкая / 11-16 средняя /
// 17-20 умеренно высокая (позитивный маркер) / >21 слишком высокая (риск
// выгорания). Цвет дуги серый (низкая+средняя, ещё не оптимум) → зелёный
// (умеренно высокая, целевая зона) → красный (слишком высокая, зона риска).
// SCALE_MAX — теоретический максимум: 23 "да"-пункта + 9 "нет"-пунктов = 32
// (9 буферных из 41 пункта исключены из подсчёта, elers_bank.py).
const SCALE_MAX = 32;
const SEGMENTS: GaugeChartSegment[] = [
  { upTo: 16, color: 'var(--mute)' },
  { upTo: 20, color: 'var(--success)' },
  { upTo: SCALE_MAX, color: 'var(--danger)' },
];

/** Elers achievement motivation «Уровень притязаний» — Gauge Chart. PRO-338
 *  Ф1.8 (02-Фаза1-Лёгкие-тесты.md §1.В). 9 буферных пунктов из 41
 *  исключены из подсчёта на бэкенде (elers_service.raw_score) и не
 *  раскрываются здесь — специалист видит только итоговый балл/бэнд. */
export function AspirationLevelSection({ section }: { section: AspirationLevelSectionData | null }) {
  if (!section) return null;
  const { score, level } = section;

  return (
    <AdminCard title="Уровень притязаний" description="Elers achievement motivation">
      {score !== null && (
        <div className="flex flex-col items-center gap-2 mb-2">
          <GaugeChart value={score} max={SCALE_MAX} segments={SEGMENTS} />
          <span className={cn(ADMIN_NUM, 'text-primary text-body-md')}>
            {score}/{SCALE_MAX}
          </span>
        </div>
      )}
      {level && (
        <div className="flex justify-center">
          <AdminBadge tone={LEVEL_TONES[level] ?? 'neutral'}>{LEVEL_LABELS[level] ?? level}</AdminBadge>
        </div>
      )}
      {score === null && !level && <p className={cn(ADMIN_META, 'm-0')}>Тест ещё не пройден.</p>}
    </AdminCard>
  );
}
