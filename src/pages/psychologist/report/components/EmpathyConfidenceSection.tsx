import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { EmpathyConfidenceSection as EmpathyConfidenceSectionData } from '@/shared/types';
import { PolarAreaChart, type PolarAreaSector } from './PolarAreaChart';
import { StenProgressBar } from './StenProgressBar';

const CHANNEL_LABELS: Record<string, string> = {
  rational: 'Рациональный',
  emotional: 'Эмоциональный',
  intuitive: 'Интуитивный',
  attitudes: 'Установки',
  penetration: 'Проникающая способность',
  identification: 'Идентификация',
};

const CHANNEL_ORDER = ['rational', 'emotional', 'intuitive', 'attitudes', 'penetration', 'identification'];

// Short forms for the chart's own wedge labels — "Проникающая способность"
// wrapped around a 260px circle collides with its neighbours; the full name
// stays in the list below the chart.
const CHANNEL_SHORT_LABELS: Record<string, string> = {
  rational: 'Рацион.',
  emotional: 'Эмоц.',
  intuitive: 'Интуит.',
  attitudes: 'Установки',
  penetration: 'Проникн.',
  identification: 'Идентиф.',
};

const EMPATHY_LEVEL_LABELS: Record<string, string> = {
  very_low: 'Очень низкая',
  underestimated: 'Заниженная',
  average: 'Средняя',
  very_high: 'Очень высокая',
};

const EMPATHY_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  very_low: 'danger',
  underestimated: 'quiet',
  average: 'quiet',
  very_high: 'brand',
};

const CONFIDENCE_LEVEL_LABELS: Record<string, string> = {
  high: 'Высокая уверенность',
  normative: 'Нормативный диапазон',
  low: 'Низкая уверенность',
};

const CONFIDENCE_LEVEL_TONES: Record<string, AdminBadgeTone> = {
  high: 'brand',
  normative: 'quiet',
  low: 'danger',
};

const CHANNEL_MAX = 6;

/** Бойко «Эмпатия» (Polar Area Chart, 6 каналов) + Кондаш/Прихожан «Соц.
 *  уверенность» (линейный прогресс-бар, стены 1-10, нормативная зона 4-6
 *  подсвечена). PRO-338 Ф1.12 (02-Фаза1-Лёгкие-тесты.md §1.Г). */
export function EmpathyConfidenceSection({ section }: { section: EmpathyConfidenceSectionData | null }) {
  if (!section) return null;
  const { empathy_channels, empathy_total, empathy_level, confidence_stens, confidence_level } = section;

  const sectors: PolarAreaSector[] | null = empathy_channels
    ? CHANNEL_ORDER.filter((key) => key in empathy_channels).map((key) => ({
        key,
        label: CHANNEL_SHORT_LABELS[key] ?? key,
        value: empathy_channels[key],
      }))
    : null;

  return (
    <AdminCard title="Эмпатия и уверенность" description="Бойко + Кондаш/Прихожан">
      {sectors && sectors.length > 0 && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <PolarAreaChart sectors={sectors} max={CHANNEL_MAX} />
          <div className="flex items-center gap-2">
            {empathy_total !== null && (
              <span className={cn(ADMIN_NUM, 'text-primary')}>
                Итого: {empathy_total}/36
              </span>
            )}
            {empathy_level && (
              <AdminBadge tone={EMPATHY_LEVEL_TONES[empathy_level] ?? 'neutral'}>
                {EMPATHY_LEVEL_LABELS[empathy_level] ?? empathy_level}
              </AdminBadge>
            )}
          </div>
          <ul className="m-0 p-0 list-none flex flex-col gap-1 w-full max-w-[260px]">
            {sectors.map((sector) => (
              <li key={sector.key} className="flex items-center justify-between gap-2">
                <span className={ADMIN_META}>{CHANNEL_LABELS[sector.key] ?? sector.key}</span>
                <span className={ADMIN_NUM}>{sector.value}/{CHANNEL_MAX}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confidence_stens !== null && (
        <div className="pt-3 border-t border-default">
          <div className={cn(ADMIN_TEXT, 'flex items-center justify-between gap-2 mb-2')}>
            <span className="text-secondary">Социальная уверенность</span>
            {confidence_level && (
              <AdminBadge tone={CONFIDENCE_LEVEL_TONES[confidence_level] ?? 'neutral'}>
                {CONFIDENCE_LEVEL_LABELS[confidence_level] ?? confidence_level}
              </AdminBadge>
            )}
          </div>
          <StenProgressBar value={confidence_stens} min={1} max={10} normativeFrom={4} normativeTo={6} />
        </div>
      )}
    </AdminCard>
  );
}
