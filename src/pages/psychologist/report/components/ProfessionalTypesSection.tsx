import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { ProfessionalTypesSection as ProfessionalTypesSectionData } from '@/shared/types';
import { RadarChart, type RadarChartAxis } from './RadarChart';

const AXES: RadarChartAxis[] = [
  { key: 'practical', label: 'Ч-П' },
  { key: 'technical', label: 'Ч-Т' },
  { key: 'social', label: 'Ч-Ч' },
  { key: 'sign', label: 'Ч-З' },
  { key: 'artistic', label: 'Ч-Х' },
];

const SCALE_LABELS: Record<string, string> = {
  practical: 'Человек-природа',
  technical: 'Человек-техника',
  social: 'Человек-человек',
  sign: 'Человек-знак',
  artistic: 'Человек-худ. образ',
};

// Ф1.3 фактический максимум интереса — из scripts/professional_types_bank.py
// (проверено пересчётом): 20 пар × 2 опции = 40 слотов, ровно поделённых на
// 5 шкал = 8 слотов на шкалу, физический максимум одной шкалы = 8 (не 9-10
// «на глаз» из тикета). Бэнды спецификации (0-4/4-8/8-12) оставлены как в
// источнике, не сужены пропорционально — верхняя граница "повышенный" (12)
// физически недостижима, а сужение диапазонов было бы решением поверх
// источника, которое спецификация не даёт. "Повышенный" достижим только на
// границе 8 (весь блок из 8 пар — в одну шкалу) — редкий пограничный случай,
// решение зафиксировано здесь и в PR-описании (см. тикет Ф1.3).
const INTEREST_MAX = 8;
const ABILITIES_MAX = 3;

function interestBand(score: number): { label: string; tone: 'quiet' | 'brand' } {
  if (score >= 8) return { label: 'повышенный', tone: 'brand' };
  if (score >= 4) return { label: 'средний', tone: 'quiet' };
  return { label: 'слабый', tone: 'quiet' };
}

/** ДДО «Профессиональные типы» — Radar Chart, два наложенных полигона
 *  (интересы / способности), 5 осей. Ф1.3 (02-Фаза1-Лёгкие-тесты.md §1.А). */
export function ProfessionalTypesSection({ section }: { section: ProfessionalTypesSectionData | null }) {
  if (!section) return null;
  const { interest_scores, abilities_scores, hybrid_profile } = section;
  const hasChart = Boolean(interest_scores || abilities_scores);

  return (
    <AdminCard title="Профессиональные типы" description="ДДО Климова + Йовайши/Резапкина">
      {hybrid_profile && hybrid_profile.length === 2 && (
        <p className={cn(ADMIN_META, 'mb-3')}>
          Гибридный профиль:{' '}
          <span className="font-semibold text-primary">
            {SCALE_LABELS[hybrid_profile[0]] ?? hybrid_profile[0]} + {SCALE_LABELS[hybrid_profile[1]] ?? hybrid_profile[1]}
          </span>{' '}
          — две ведущие шкалы интересов почти равны, вести обе гипотезы на приёме.
        </p>
      )}

      {hasChart && (
        <div className="flex flex-col items-center gap-3 mb-3">
          <RadarChart
            axes={AXES}
            series={[
              ...(interest_scores
                ? [{ key: 'interest', label: 'Интересы', color: 'var(--brand)', values: interest_scores, max: INTEREST_MAX }]
                : []),
              ...(abilities_scores
                ? [{ key: 'abilities', label: 'Способности', color: 'var(--accent)', values: abilities_scores, max: ABILITIES_MAX }]
                : []),
            ]}
          />
          <div className="flex items-center gap-3">
            {interest_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--brand)' }} />
                Интересы
              </span>
            )}
            {abilities_scores && (
              <span className={cn(ADMIN_META, 'inline-flex items-center gap-1.5')}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
                Способности
              </span>
            )}
          </div>
        </div>
      )}

      {interest_scores && (
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {AXES.map((axis) => {
            const score = interest_scores[axis.key] ?? 0;
            const band = interestBand(score);
            const ability = abilities_scores?.[axis.key];
            return (
              <li key={axis.key} className="flex items-center justify-between gap-2">
                <span className={ADMIN_TEXT}>{SCALE_LABELS[axis.key]}</span>
                <span className="flex items-center gap-2">
                  <span className={ADMIN_NUM}>
                    {score}/{INTEREST_MAX}
                    {ability !== undefined && <span className={ADMIN_META}> · сп. {ability}/{ABILITIES_MAX}</span>}
                  </span>
                  <AdminBadge tone={band.tone}>{band.label}</AdminBadge>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
