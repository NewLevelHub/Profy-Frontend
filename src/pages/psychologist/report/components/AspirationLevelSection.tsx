import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminBadge, type AdminBadgeTone } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM } from '@/shared/ui/admin/density';
import type { AspirationLevelSection as AspirationLevelSectionData } from '@/shared/types';
import { GaugeChart, type GaugeChartSegment } from './GaugeChart';
import { PsychTestHeaderInfo } from './PsychTestHeaderInfo';
import { PsychDetailCard } from './PsychDetailCard';
import { PsychBandMeter, type BandMark } from './PsychBandMeter';
import { BinaryEvidenceView } from './AnswerEvidence';
import { ScoreRow } from './ScoreRow';
import {
  getElersMethodology,
  getElersLevels,
} from '../model/psychTestExplanations';

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

/**
 * Elers achievement motivation "Level of aspiration" — Gauge Chart +
 * detailed evidence disclosure for psychologist.
 */
export function AspirationLevelSection({ section }: { section: AspirationLevelSectionData | null }) {
  const { t } = useTranslation('psychReport');
  if (!section) return null;

  const methodology = getElersMethodology(t);
  const levels = getElersLevels(t);

  const levelLabels = (t('psychReport:elers.levelLabels', {
    returnObjects: true,
  }) || {}) as Record<string, string>;
  const bandsMap = (t('psychReport:elers.bands', {
    returnObjects: true,
  }) || {}) as Record<string, string>;

  const elersBands: BandMark[] = [
    { label: bandsMap.low ?? '', min: 1, max: 10 },
    { label: bandsMap.medium ?? '', min: 11, max: 16 },
    { label: bandsMap.moderately_high ?? '', min: 17, max: 20 },
    { label: bandsMap.too_high ?? '', min: 21, max: 32 },
  ];

  const { score, level } = section;

  // Selected level to inspect (defaults to student's achieved level)
  const [selectedLevelKey, setSelectedLevelKey] = useState<string | null>(level ?? 'moderately_high');

  const activeLevelInfo = selectedLevelKey && selectedLevelKey in levels ? levels[selectedLevelKey] : null;

  return (
    <AdminCard title={t('psychReport:elers.cardTitle')} description={t('psychReport:elers.cardDescription')}>
      <PsychTestHeaderInfo methodology={methodology} />

      {score !== null && (
        <div className="flex flex-col items-center gap-2 mb-2">
          <GaugeChart value={score} max={SCALE_MAX} segments={SEGMENTS} />
          <span className={cn(ADMIN_NUM, 'text-primary text-body-md')}>
            {score}/{SCALE_MAX}
          </span>
        </div>
      )}

      {score !== null && (
        <div className="mb-3">
          <PsychBandMeter
            value={score}
            max={SCALE_MAX}
            bands={elersBands}
            label={t('psychReport:elers.normativeBandsLabel')}
          />
        </div>
      )}

      {level && (
        <ScoreRow
          label={<span className={cn(ADMIN_META, 'font-sans text-body-sm')}>{t('psychReport:elers.motivationLevelLabel')}</span>}
          badge={<AdminBadge tone={LEVEL_TONES[level] ?? 'neutral'}>{levelLabels[level] ?? level}</AdminBadge>}
          isOpen={selectedLevelKey === level}
          onToggle={() => setSelectedLevelKey(selectedLevelKey === level ? null : level)}
        >
          {activeLevelInfo && (
            <PsychDetailCard
              bare
              title={activeLevelInfo.name}
              badge={<AdminBadge tone={LEVEL_TONES[level] ?? 'neutral'}>{activeLevelInfo.name}</AdminBadge>}
              meaning={activeLevelInfo.meaning}
              means={activeLevelInfo.behavioralManifestation}
              follows={activeLevelInfo.psychologistFocus}
              why={t('psychReport:elers.whyScore', {
                score: score ?? 0,
                norms: activeLevelInfo.normsExplanation ?? '',
              })}
              riskWarning={activeLevelInfo.riskWarning}
            >
              {section.evidence && <BinaryEvidenceView evidence={section.evidence} />}
            </PsychDetailCard>
          )}
        </ScoreRow>
      )}

      {score === null && !level && (
        <p className={cn(ADMIN_META, 'm-0')}>{t('psychReport:elers.notCompleted')}</p>
      )}
    </AdminCard>
  );
}
