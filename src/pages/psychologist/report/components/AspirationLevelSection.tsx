import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM } from '@/shared/ui/admin/density';
import type { AspirationLevelSection as AspirationLevelSectionData } from '@/shared/types';
import { GaugeChart, type GaugeChartSegment } from './GaugeChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { PsychBandMeter, type BandMark } from './PsychBandMeter';
import {
  ELERS_METHODOLOGY,
  ELERS_LEVELS,
} from '../model/psychTestExplanations';

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

const SCALE_MAX = 32;
const SEGMENTS: GaugeChartSegment[] = [
  { upTo: 16, color: 'var(--mute)' },
  { upTo: 20, color: 'var(--success)' },
  { upTo: SCALE_MAX, color: 'var(--danger)' },
];

const ELERS_BANDS: BandMark[] = [
  { label: 'Низкая', min: 1, max: 10 },
  { label: 'Средняя', min: 11, max: 16 },
  { label: 'Умеренно выс.', min: 17, max: 20 },
  { label: 'Слишком выс.', min: 21, max: 32 },
];

/**
 * Elers achievement motivation «Уровень притязаний» — Gauge Chart +
 * подробное доказательное раскрытие для психолога.
 */
export function AspirationLevelSection({ section }: { section: AspirationLevelSectionData | null }) {
  if (!section) return null;
  const { score, level } = section;

  // Selected level to inspect (defaults to student's achieved level)
  const [selectedLevelKey, setSelectedLevelKey] = useState<string | null>(level ?? 'moderately_high');

  const activeLevelInfo = selectedLevelKey && selectedLevelKey in ELERS_LEVELS ? ELERS_LEVELS[selectedLevelKey] : null;

  return (
    <AdminCard title="Уровень притязаний" description="Elers achievement motivation">
      <PsychTestHeaderInfo methodology={ELERS_METHODOLOGY} />

      {score !== null && (
        <div className="flex flex-col items-center gap-2 mb-2">
          <GaugeChart value={score} max={SCALE_MAX} segments={SEGMENTS} />
          <span className={cn(ADMIN_NUM, 'text-primary text-body-md')}>
            {score}/{SCALE_MAX}
          </span>
        </div>
      )}

      {level && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLevelKey(selectedLevelKey === level ? null : level)}
            className="inline-flex items-center gap-2 p-1 focus:outline-none group"
            title="Нажмите для просмотра разбора уровня"
          >
            <AdminBadge tone={LEVEL_TONES[level] ?? 'neutral'}>
              {LEVEL_LABELS[level] ?? level}
            </AdminBadge>
            <span className={cn(ADMIN_META, 'group-hover:text-primary transition-colors flex items-center gap-0.5 text-tiny')}>
              {selectedLevelKey === level ? 'Свернуть' : 'Подробный разбор'}
              <ChevronDown size={13} className={cn('transition-transform', selectedLevelKey === level && 'rotate-180')} />
            </span>
          </button>
        </div>
      )}

      {score !== null && (
        <div className="mt-3">
          <PsychBandMeter
            value={score}
            max={SCALE_MAX}
            bands={ELERS_BANDS}
            label="Нормативные зоны мотивации Элерса"
          />
        </div>
      )}

      {/* Expanded RIASEC-style Detail Card */}
      {activeLevelInfo && (
        <PsychDetailCard
          title={activeLevelInfo.name}
          badge={<AdminBadge tone={LEVEL_TONES[selectedLevelKey!] ?? 'neutral'}>{activeLevelInfo.name}</AdminBadge>}
          meaning={activeLevelInfo.meaning}
          means={activeLevelInfo.behavioralManifestation}
          follows={activeLevelInfo.psychologistFocus}
          why={`Сырой балл: ${score ?? 0} из 32. ${activeLevelInfo.normsExplanation ?? ''}`}
          riskWarning={activeLevelInfo.riskWarning}
          onClose={() => setSelectedLevelKey(null)}
        />
      )}

      {score === null && !level && <p className={cn(ADMIN_META, 'm-0')}>Тест ещё не пройден.</p>}
    </AdminCard>
  );
}
